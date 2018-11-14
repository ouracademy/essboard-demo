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

test("should remove", () => {
  const project = new Project("ouracademy");
  project.join(artmadeit);
  project.join(qpdiam);

  project.removeMember(artmadeit);
  expect(project.hasMember(artmadeit)).toBeFalsy();
});
