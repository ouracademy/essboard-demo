import { generateKey } from "../util";
import { createFile, deleteFile } from "../git-client";
import { projectRepository } from "../repo";
import { MemberService } from "./members";
export class ProjectService {
  static create(owner, name) {
    const key = generateKey(name);
    const status = { states: [] };
    const path = name + key + ".json";
    return createFile(path, status, "create file: " + path)
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
        console.log("error create file", err);
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
  static remove(query) {
    return projectRepository.find(query, {}).then(projects => {
      let promises = [];
      for (let i = 0; i < projects.length; i++) {
        promises.push(() =>
          deleteFile(
            projects[i].path,
            projects[i].lastSnapshot,
            "delete file:" + projects[i].path
          )
        );
      }

      return promises.reduce(
        (promise, func) =>
          promise.then(result =>
            func().then(() => {
              return projectRepository.remove(query, {});
            })
          ),
        Promise.resolve([])
      );
    });
  }
}
