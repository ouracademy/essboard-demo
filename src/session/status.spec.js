"use strict";

import { Project } from "../project";
import { artmadeit, qpdiam } from "../project.spec";
import { stakeholder } from "../kernel-test-data";
import { createEventStore } from "./index";
import { User } from "../user";
import { MockDate } from "../MockDate";

import { byState, evaluatedBy, isApprobeForAll } from "./status";

describe("evaluatedBy", () => {
  let session;
  beforeEach(() => {
    createEventStore();
    const project = new Project("ouracademy");
    project.join(artmadeit);
    project.join(qpdiam);

    session = project.startNewSession();
    session.vote(artmadeit, "111");
    session.vote(qpdiam, "111");
    session.vote(qpdiam, "112");
    session.vote(artmadeit, "112");
    session.vote(artmadeit, "121");
    session.end();
  });

  it("get votes by checkpoint", () => {
    const votesByCheckpoint = session.status.getVotesByCheckpoint();
    // in order to make more easy the test
    const result = votesByCheckpoint.map(x => ({
      checkpointId: x.checkpointId,
      voters: x.votes.map(v => v.voter)
    }));

    expect(result).toEqual([
      { checkpointId: "111", voters: [artmadeit, qpdiam] },
      { checkpointId: "112", voters: [qpdiam, artmadeit] },
      { checkpointId: "121", voters: [artmadeit] }
    ]);
  });

  it("every member", () => {
    expect(evaluatedBy(stakeholder.states[0], session.status)).toBe(
      "every-member"
    );
  });

  it("any member", () => {
    expect(evaluatedBy(stakeholder.states[1], session.status)).toBe(
      "any-member"
    );
  });

  it("no body", () => {
    expect(evaluatedBy(stakeholder.states[2], session.status)).toBe("no-body");
  });
});

test("isApprobeForAll()", () => {
  const f = isApprobeForAll([artmadeit, qpdiam]);
  expect(f([artmadeit, qpdiam])).toBeTruthy();
  expect(f([qpdiam, artmadeit])).toBeTruthy();
  expect(f([qpdiam])).toBeFalsy();
});

test("byState()", () => {
  expect(byState(11)("111")).toBeTruthy();
  expect(byState(12)("121")).toBeTruthy();
  expect(byState(11)("131")).toBeFalsy();
});

const times = [
  new Date(2018, 9, 30),
  new Date(2018, 10, 1),
  new Date(2018, 10, 2),
  new Date(2018, 10, 3),
  new Date(2018, 10, 4)
];

describe("alphaStates()", () => {
  let project;
  beforeEach(() => {
    createEventStore();
    MockDate.set(times[0]);

    project = new Project("ouracademy");
    project.join(artmadeit);
    project.join(qpdiam);

    MockDate.set(times[1]);
    const session1 = project.startNewSession();
    session1.vote(artmadeit, "111");
    session1.vote(qpdiam, "111");
    session1.end();

    MockDate.set(times[2]);
    const session2 = project.startNewSession();
    session2.vote(qpdiam, "112");
    session2.removeVote(qpdiam, "112");
    session2.vote(qpdiam, "112");
    session2.vote(artmadeit, "112");
    session2.vote(artmadeit, "121");
    session2.end();

    MockDate.set(times[3]);
    const session3 = project.startNewSession();
    session3.vote(qpdiam, "121");
    session3.vote(qpdiam, "122");
    session3.vote(artmadeit, "122");
    session3.end();

    MockDate.set(times[4]);
    const session4 = project.startNewSession();
    session4.vote(artmadeit, "131");
    session4.vote(qpdiam, "131");
    session4.end();
  });

  const stateIn3rdSession = [
    { evaluatedBy: "every-member", id: 11 },
    { evaluatedBy: "every-member", id: 12 },
    { evaluatedBy: "no-body", id: 13 }
  ];

  it.each([
    [
      2,
      [
        { evaluatedBy: "every-member", id: 11 },
        { evaluatedBy: "any-member", id: 12 },
        { evaluatedBy: "no-body", id: 13 }
      ]
    ],
    [3, stateIn3rdSession],
    [
      4,
      [
        { evaluatedBy: "every-member", id: 11 },
        { evaluatedBy: "every-member", id: 12 },
        { evaluatedBy: "any-member", id: 13 }
      ]
    ]
  ])("should consume alpha information for session %i", (n, expected) => {
    expect(project.sessions[n - 1].status.alphaStates(stakeholder)).toEqual(
      expected
    );
  });

  describe("shouldn't alterate past alpha states", () => {
    afterEach(() => {
      expect(project.sessions[2].status.alphaStates(stakeholder)).toEqual(
        stateIn3rdSession
      );
    });

    it("when past alpha states when a member is joined", () => {
      const eli = new User("eli");
      project.join(eli);
      const session5 = project.startNewSession();
      session5.vote(eli, "131");
      session5.end();

      expect(session5.status.alphaStates(stakeholder)).toEqual([
        { evaluatedBy: "every-member", id: 11 },
        { evaluatedBy: "every-member", id: 12 },
        { evaluatedBy: "any-member", id: 13 }
      ]);
    });

    it("when a member is removed", () => {
      const session5 = project.startNewSession();
      project.removeMember(artmadeit);
      session5.vote(qpdiam, "132");
      session5.end();

      expect(session5.status.alphaStates(stakeholder)).toEqual([
        { evaluatedBy: "every-member", id: 11 },
        { evaluatedBy: "every-member", id: 12 },
        { evaluatedBy: "every-member", id: 13 }
      ]);
    });

    it("when removing a vote", () => {
      // sadly the PO changed ..so Stakeholder is in Represented state
      const session5 = project.startNewSession();
      session5.removeVote(qpdiam, "131");
      session5.removeVote(artmadeit, "131");
      session5.end();

      expect(session5.status.alphaStates(stakeholder)).toEqual(
        stateIn3rdSession
      );
    });
  });
});
