"use strict";

import { ProjectService } from "./projects";

describe("create project", () => {
  it("should has a name", () => {
    return ProjectService.create("diana", "Ouracademy").then(project =>
      expect(project.name).toBe("Ouracademy")
    );
  });
});
