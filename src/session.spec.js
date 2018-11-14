"use strict";

import { Project } from "./project";
import { artmadeit, qpdiam } from "./project.spec";

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

  describe("ending session", () => {
    beforeEach(() => {
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
  });
});
