"use strict";

import { Project } from "./project";
import { artmadeit, qpdiam } from "./project.spec";
import { stakeholder } from "./kernel-test-data";
import { isApprobeForAll, evaluatedBy, byState } from "./session";
import { User } from "./user";

const MockDate = {
  realDate: Date,
  set(date) {
    /*eslint no-global-assign:off*/
    global.Date = class extends Date {
      constructor() {
        return date;
      }
    };
  },
  reset() {
    global.Date = this.realDate;
  }
};

describe("session", () => {
  let project, session;
  const currentDate = new Date("2017-06-13T04:41:20");

  beforeEach(() => {
    MockDate.set(currentDate);

    project = new Project("ouracademy");
    session = project.startNewSession();
    project.join(artmadeit);
    project.join(qpdiam);
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe("start new session", () => {
    it("should start a new session with current date", () => {
      expect(session.createdAt).toEqual(currentDate);
    });
    it("shouldn't create a session when the current session doesn't finished", () => {
      expect(() => project.startNewSession()).toThrow(
        "There's already a current that doesn't finished"
      );
    });
  });

  describe("voting", () => {
    beforeEach(() => {
      session.vote(artmadeit, 11);
      session.vote(qpdiam, 11);
    });

    it("should get voters", () => {
      expect(session.voters).toEqual([artmadeit, qpdiam]);
    });

    it("should remove a vote", () => {
      session.removeVote(artmadeit, 11);
      expect(session.voters).toEqual([qpdiam]);
    });

    it("shouldn't vote if it's not a member", () => {
      expect(() => session.vote(new User("eli"), 11)).toThrow(
        "Sorry, eli is not a member"
      );
    });
  });

  describe("ending session", () => {
    beforeEach(() => {
      session.vote(artmadeit, 21);
      session.end();
    });

    it("should set end date & finish the session", () => {
      expect(session.endDate).toBe(currentDate);
      expect(session.isFinished).toBeTruthy();
    });

    it("should add all current project members", () => {
      expect(session.members).toEqual([artmadeit, qpdiam]);
    });

    it("no one can vote when the session it's already finished", () => {
      expect(() => session.vote(artmadeit, 11)).toThrow(
        "Session is finished, no one can vote"
      );
    });
    it("no one can remove a vote when the session it's already finished", () => {
      expect(() => session.removeVote(artmadeit, 21)).toThrow(
        "Session is finished, no one can remove a vote"
      );
    });
  });

  describe("previousSession", () => {
    test("must be undefined if is 1st session", () => {
      expect(session.previousSession).toBe(undefined);
    });
    test("must be last session", () => {
      session.end();
      const newSession = project.startNewSession();
      expect(newSession.previousSession).toBe(session);
    });
  });
});

describe("evaluatedBy", () => {
  let session;
  beforeEach(() => {
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
    const votesByCheckpoint = session.getVotesByCheckpoint();
    expect(votesByCheckpoint["111"].map(x => x.voter)).toEqual([
      artmadeit,
      qpdiam
    ]);

    expect(votesByCheckpoint["112"].map(x => x.voter)).toEqual([
      qpdiam,
      artmadeit
    ]);

    expect(votesByCheckpoint["121"].map(x => x.voter)).toEqual([artmadeit]);
  });

  it("every member", () => {
    expect(evaluatedBy(stakeholder.states[0], session)).toBe("every-member");
  });

  it("any member", () => {
    expect(evaluatedBy(stakeholder.states[1], session)).toBe("any-member");
  });

  it("no body", () => {
    expect(evaluatedBy(stakeholder.states[2], session)).toBe("no-body");
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
    MockDate.set(times[0]);

    project = new Project("ouracademy");
    project.join(artmadeit);
    project.join(qpdiam);

    MockDate.set(times[1]);
    const session1 = project.startNewSession();
    session1.vote(artmadeit, 111);
    session1.vote(qpdiam, 111);
    session1.end();

    MockDate.set(times[2]);
    const session2 = project.startNewSession();
    session2.vote(qpdiam, 112);
    session2.removeVote(qpdiam, 112);
    session2.vote(qpdiam, 112);
    session2.vote(artmadeit, 112);
    session2.vote(artmadeit, 121);
    session2.end();

    MockDate.set(times[3]);
    const session3 = project.startNewSession();
    session3.vote(qpdiam, 121);
    session3.vote(qpdiam, 122);
    session3.vote(artmadeit, 122);
    session3.end();

    MockDate.set(times[4]);
    const session4 = project.startNewSession();
    session4.vote(artmadeit, 131);
    session4.vote(qpdiam, 131);
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
    expect(project.sessions[n - 1].alphaStates(stakeholder)).toEqual(expected);
  });

  describe("shouldn't alterate past alpha states", () => {
    afterEach(() => {
      expect(project.sessions[2].alphaStates(stakeholder)).toEqual(
        stateIn3rdSession
      );
    });

    it("when past alpha states when a member is joined", () => {
      const eli = new User("eli");
      project.join(eli);
      const session5 = project.startNewSession();
      session5.vote(eli, 131);
      session5.end();

      expect(session5.alphaStates(stakeholder)).toEqual([
        { evaluatedBy: "every-member", id: 11 },
        { evaluatedBy: "every-member", id: 12 },
        { evaluatedBy: "any-member", id: 13 }
      ]);
    });

    it("when a member is removed", () => {
      const session5 = project.startNewSession();
      project.removeMember(artmadeit);
      session5.vote(qpdiam, 132);
      session5.end();

      expect(session5.alphaStates(stakeholder)).toEqual([
        { evaluatedBy: "every-member", id: 11 },
        { evaluatedBy: "every-member", id: 12 },
        { evaluatedBy: "every-member", id: 13 }
      ]);
    });

    it("when removing a vote", () => {
      // sadly the PO changed ..so Stakeholder is in Represented state
      const session5 = project.startNewSession();
      session5.removeVote(qpdiam, 131);
      session5.removeVote(artmadeit, 131);
      session5.end();

      expect(session5.alphaStates(stakeholder)).toEqual(stateIn3rdSession);
    });
  });
});
