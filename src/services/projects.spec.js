"use strict";

import { ProjectService } from "./projects";
let nameProject = "Ouracademy";
describe("create project", () => {
  afterAll(async done => {
    ProjectService.remove({ name: nameProject }).then(result => {
      done();
    });
  });
  it("should has a name", () => {
    return ProjectService.create("diana", nameProject).then(project =>
      expect(project.name).toBe("Ouracademy")
    );
  });
  it("should crate project with same name", () => {
    return ProjectService.create("arthur", nameProject).then(newProject => {
      expect(newProject.name).toBe("Ouracademy");
    });
  });
  it("should remove a project", () => {
    return ProjectService.create("arthur", "Proyecto a eliminar").then(
      project => {
        return ProjectService.remove({ _id: project._id }).then(removed => {
          return ProjectService.find({ _id: project._id }).then(result => {
            expect(result).toBe(null);
          });
        });
      }
    );
  });
});
