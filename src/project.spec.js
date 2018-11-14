"use strict";

import { Project } from "./project";
import { User } from "./user";

describe("create project", () => {
  it("should has a name", () => {
    const project = new Project("ouracademy");
    expect(project.name).toBe("ouracademy");
  });
});

export const artmadeit = new User("artmadeit");
export const qpdiam = new User("qpdiam");

describe("add a members", () => {
  let project;
  beforeEach(() => {
    project = new Project("ouracademy");
    project.join(artmadeit);
    project.join(qpdiam);
  });

  it("should has member", () => {
    project.hasMember(artmadeit);
  });

  it("shouldn't add an existing member", () => {
    expect(() => project.join(artmadeit)).toThrow(
      "Sorry that person is already a member"
    );
  });
});

describe("start new session", () => {
  let project;
  beforeEach(() => {
    project = new Project("ouracademy");
    project.join(artmadeit);
    project.join(qpdiam);
  });

  it("should start a new session with current date", () => {
    const constantDate = new Date("2017-06-13T04:41:20");

    /*eslint no-global-assign:off*/
    Date = class extends Date {
      constructor() {
        return constantDate;
      }
    };

    expect(project.startNewSession().createdAt).toEqual(constantDate);
  });
  it("shouldn't create a session when the current session doesn't finished", () => {
    project.startNewSession();
    expect(() => project.startNewSession()).toThrow(
      "There's already a current that doesn't finished"
    );
  });
});
