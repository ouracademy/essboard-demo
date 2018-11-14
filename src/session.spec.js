"use strict";

import { Project } from "./project";
import { artmadeit, qpdiam } from "./project.spec";
import { stakeholder } from "./kernel-test-data";
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

  it("get members by checkpoint", () => {
    expect(session.membersByCheckpoint).toEqual({
      "111": [artmadeit, qpdiam],
      "112": [qpdiam, artmadeit],
      "121": [artmadeit]
    });
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

describe("voting", () => {
  let session2;
  beforeEach(() => {
    MockDate.set(times[0]);

    const project = new Project("ouracademy");
    project.join(artmadeit);
    project.join(qpdiam);

    MockDate.set(times[1]);
    const session1 = project.startNewSession();
    session1.vote(artmadeit, 111);
    session1.vote(qpdiam, 111);
    session1.end();

    MockDate.set(times[2]);
    session2 = project.startNewSession();
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

  it("should consume alpha information for session 2", async function() {
    expect(session2.alphaStates(stakeholder)).toEqual([
      {
        evaluatedBy: "every-member",
        id: 11
      },
      {
        evaluatedBy: "any-member",
        id: 12
      },
      {
        evaluatedBy: "no-body",
        id: 13
      }
    ]);
  });
});
