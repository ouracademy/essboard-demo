import { generateKey } from "../util";
import { createFile } from "../git-client";
import { projectRepository } from "../repo";
import { MemberService } from "./members";
export class ProjectService {
  static async create(owner, name) {
    const key = generateKey(name);
    const status = { states: [] };
    const path = key + ".json";

    return createFile(path, status)
      .then(result => {
        const contentSha = result["data"]["content"]["sha"];
        MemberService.create(key, owner, "owner");
        return projectRepository.insert({
          name,
          status,
          key,
          path,
          lastSnapshot: contentSha
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  static find(query) {
    return projectRepository.findOne(query);
  }

  static getLastSnapshot(key) {
    return projectRepository
      .findOne({ key })
      .then(project => project.lastSnapshot);
  }

  static updateLastSnapshot(key, newSnapshot) {
    return ProjectService.find({ key }).then(project => {
      const newProject = { ...project, ...{ lastSnapshot: newSnapshot } };
      return projectRepository.update({ key }, newProject, {});
    });
  }
}
