"use strict";

import { Project } from "./project";
import { artmadeit, qpdiam } from "./project.spec";
import { createEventStore } from "./session";
import { User } from "./user";
import { MockDate } from "./MockDate";

describe("session", () => {
  let project, session;
  const currentDate = new Date("2017-06-13T04:41:20");

  beforeEach(() => {
    createEventStore();
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
