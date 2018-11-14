const { btoa } = require("abab");
import {
  octoKitAuthenticated,
  generateKey,
  membersDb,
  changesDb,
  projectsDb,
  getContentFrom,
  update,
  Status
} from "./util";

export function createProject(owner, nameProject) {
  const key = generateKey(nameProject);
  const status = { states: [] };
  return octoKitAuthenticated.repos
    .createFile({
      owner: "qpdian",
      repo: "demo",
      path: key + ".json",
      message: "init monitoring",
      content: btoa(JSON.stringify(status))
    })
    .then(result => {
      projectsDb.insert({
        name: nameProject,
        status,
        key,
        path: key + ".json",
        lastSnapshot: result["data"]["content"]["sha"]
      });
      membersDb.insert({ project: key, name: owner, role: "owner" });
      changesDb.insert({
        project: key,
        contentSha: result["data"]["content"]["sha"],
        reason: "init",
        session: null
      });
    });
}
export function addMember(projectKey, memberName) {
  membersDb.insert({
    project: projectKey,
    name: memberName,
    role: "colaborator"
  });
}

export function addVotes(projectKey, votes, sessionNumber) {
  projectsDb.find({ key: projectKey }, function(err, docs) {
    if (err) {
      console.log(err);
      return;
    }
    const project = docs[0];
    const lastChange = project["lastSnapshot"];
    getContentFrom(lastChange).then(content => {
      let status = new Status(content);
      status.addVotes(votes);
      update(status.getValue(), lastChange, project["path"])
        .then(result => {
          const change = result["data"]["content"]["sha"];
          changesDb.insert({
            project: projectKey,
            contentSha: change,
            reason: "vote",
            session: sessionNumber
          });
          project["lastSnapshot"] = change;
          projectsDb.update({ key: projectKey }, project, {}, function(
            err,
            numReplaced
          ) {});
        })
        .catch(error => console.log(error));
    });
  });
}
