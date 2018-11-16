"use strict";

import { ProjectService } from "./projects";

describe("create project", () => {
  afterEach(async done => {
    ProjectService.remove({ name: "Ouracademy" }).then(result => {
      done();
    });
  });

  it("should has a name", () => {
    return ProjectService.create("diana", "Ouracademy").then(project =>
      expect(project.name).toBe("Ouracademy")
    );
  });
  it("should crate project with same name", () => {
    return ProjectService.create("arthur", "Ouracademy").then(project => {
      return ProjectService.create("arthur", "Ouracademy").then(newProject => {
        expect(newProject.name).toBe("Ouracademy");
        return ProjectService.remove({ _id: newProject._id });
      });
    });
  });
});
