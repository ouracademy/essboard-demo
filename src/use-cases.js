const { btoa } = require("abab");
import {
  octoKitAuthenticated,
  generateKey,
  membersDb,
  changesDb,
  projectsDb,
  sessionsDb,
  eventsDb,
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
      return key;
    });
}
export function addMember(projectKey, memberName) {
  membersDb.insert({
    project: projectKey,
    name: memberName,
    role: "colaborator"
  });
}
export function createSession(num, projectId) {
  sessionsDb.insert({
    projectId,
    num,
    snapshot: null
  });
}
export function addEvent(sessionNum, projectId, event) {
  eventsDb.insert({
    session: sessionNum,
    projectId,
    event
  });
}
export function getStatusBySession(sessionNum, projectId) {
  sessionsDb.find({ num: sessionNum, projectId }, function(err, sessions) {
    const session = sessions[0];
    eventsDb
      .find({ session: sessionNum, projectId })
      .sort({ createdAt: 1 })
      .exec(function(err, events) {
        const initialStatus = session.lastSnapshot
          ? getContentFrom(session.lastSnapshot)
          : Promise.resolve(null);
        return initialStatus.then(initial => {
          let status = new Status(initial);
          status.setEvents(events);
          console.log(JSON.stringify(status.getValue()));
        });
      });
  });
}

export function getCurrentState(projectId) {
  return projectsDb.find({ projectId }, function(err, projects) {
    const project = projects[0];

    return eventsDb.find({ session: sessionNum, projectId }, function(
      err,
      events
    ) {
      const initialStatus = project.status;
      let status = new Status(initialStatus);
      status.setEvents(events);
      return status.getValue();
    });
  });
}
export function endSession(sessionNum, projectId) {}

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
      status.setEvents(votes);
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
