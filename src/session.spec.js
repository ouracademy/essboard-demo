"use strict";

import { Project } from "./project";
import { artmadeit, qpdiam } from "./project.spec";

describe("end session", () => {
  let session;

  beforeEach(() => {
    const project = new Project("ouracademy");
    session = project.startNewSession();
    project.join(artmadeit);
    project.join(qpdiam);
    session.end();
  });

  it("should set end date & finish the session", () => {
    const constantDate = new Date("2017-06-13T04:41:20");

    /*eslint no-global-assign:off*/
    Date = class extends Date {
      constructor() {
        return constantDate;
      }
    };

    expect(session.endDate).toBe(constantDate);
    expect(session.isFinished).toBeTruthy();
  });

  it("should add all current project members", () => {
    expect(session.members).toEqual([artmadeit, qpdiam]);
  });

  describe("voting", () => {
    it("no one can vote when the session it's already finished", () => {
      expect(() => session.vote(artmadeit, 11)).toThrow(
        "Session is finished, no one can vote"
      );
    });
  });
});
