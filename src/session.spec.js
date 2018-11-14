"use strict";

import { Project } from "./project";
import { artmadeit, qpdiam } from "./project.spec";
import { stakeholderStates } from "./kernel-test-data";
import { isApprobeForAll, evaluatedBy, byState } from "./session";

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
});

describe("evaluatedBy", () => {
  let session;
  beforeEach(() => {
    const project = new Project("ouracademy");
    project.join(artmadeit);
    project.join(qpdiam);

    session = project.startNewSession();
    session.vote(artmadeit, 111);
    session.vote(qpdiam, 111);
    session.vote(qpdiam, 112);
    session.vote(artmadeit, 112);
    session.vote(artmadeit, 121);
    session.end();
  });

  const votes = {
    "111": [artmadeit, qpdiam],
    "112": [qpdiam, artmadeit],
    "121": [artmadeit]
  };

  it("evaluatedBy() every member", () => {
    expect(evaluatedBy(stakeholderStates[0], votes, session.voters)).toBe(
      "every-member"
    );
  });

  it("evaluatedBy() any member", () => {
    expect(evaluatedBy(stakeholderStates[1], votes, session.voters)).toBe(
      "any-member"
    );
  });

  it("evaluatedBy() no body", () => {
    expect(evaluatedBy(stakeholderStates[2], votes, session.voters)).toBe(
      "no-body"
    );
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

// describe("voting", () => {
//   let session1;
//   beforeEach(() => {
//     MockDate.set(times[0]);

//     const project = new Project("ouracademy");
//     project.join(artmadeit);
//     project.join(qpdiam);

//     MockDate.set(times[1]);
//     session1 = project.startNewSession();
//     session1.vote(artmadeit, 111);
//     session1.vote(qpdiam, 111);
//     session1.end();

//   MockDate.set(times[2]);
//   const session2 = project.startNewSession();
//   session2.vote(qpdiam, 112);
//   session2.removeVote(qpdiam, 112);
//   session2.vote(qpdiam, 112);
//   session2.vote(artmadeit, 112);
//   session2.vote(artmadeit, 121);
//   session2.end();

//   MockDate.set(times[3]);
//   const session2 = project.startNewSession();
//   session2.vote(qpdiam, 121);
//   session2.vote(qpdiam, 122);
//   session2.vote(artmadeit, 122);
//   session2.end();

//   MockDate.set(times[4]);
//   const session2 = project.startNewSession();
//   session2.vote(artmadeit, 131);
//   session2.vote(qpdiam, 131);
//   session2.end();
//   });
// });
