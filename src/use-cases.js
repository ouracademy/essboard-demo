const { btoa } = require("abab");
import { generateKey, Status } from "./util";
import { membersDb, changesDb, projectsDb, sessionsDb, eventsDb } from "./repo";
import { account } from "./config";
import { getContentFrom, update, createFile } from "./git-client";

export function createProject(owner, name) {
  const key = generateKey(name);
  const status = { states: [] };
  const path = key + ".json";

  return createFile(path, status).then(result => {
    const contentSha = result["data"]["content"]["sha"];

    projectsDb.insert({
      name,
      status,
      key,
      path,
      lastSnapshot: contentSha
    });
    addMember(key, owner, "owner");
    changesDb.insert({
      project: key,
      contentSha,
      reason: "init",
      session: null
    });
    return key;
  });
}

export function addMember(projectKey, name, role = "colaborator") {
  membersDb.insert({
    project: projectKey,
    name,
    role
  });
}

export function createSession(num, projectId, snapshot = null) {
  sessionsDb.insert({
    projectId,
    num,
    snapshot,
    endDate: null
  });
}

export function addEvent(sessionNum, projectId, event) {
  eventsDb.insert({
    session: sessionNum,
    projectId,
    event
  });
}

export function getStatusBySession(sessionNum, projectId, callBack) {
  sessionsDb.find({ num: sessionNum, projectId }, function(err, sessions) {
    const session = sessions[0];
    const statusPromise = session.snapshot
      ? getContentFrom(session.snapshot)
      : Promise.resolve(null);
    statusPromise.then(status => {
      if (session.endDate) {
        callBack(status);
      } else {
        eventsDb
          .find({ session: sessionNum, projectId })
          .sort({ createdAt: 1 })
          .exec(function(err, events) {
            let status = new Status(status);
            status.setEvents(events);
            callBack(status.getValue());
          });
      }
    });
  });
}

export function getCurrentState(key) {
  return projectsDb.find({ key }, function(err, projects) {
    const project = projects[0];

    return eventsDb.find({ session: sessionNum, key }, function(err, events) {
      const initialStatus = project.status;
      let status = new Status(initialStatus);
      status.setEvents(events);
      return status.getValue();
    });
  });
}
export function endSession(sessionNum, key) {
  sessionsDb.find({ num: sessionNum, projectId: key }, function(err, sessions) {
    const session = sessions[0];
    if (session.endDate) {
    } else {
      projectsDb.find({ key }, function(err, projects) {
        const project = projects[0];
        getStatusBySession(sessionNum, key, status => {
          update(status, project.lastSnapshot, project.path).then(result => {
            const change = result["data"]["content"]["sha"];
            session.endDate = new Date();
            session.snapshot = change;
            sessionsDb.update(
              { num: sessionNum, projectId: key },
              session,
              {},
              function(err, numReplaced) {}
            );
            project.lastSnapshot = change;
            project.lastSession = sessionNum;
            projectsDb.update({ key }, project, {}, function(
              err,
              numReplaced
            ) {});
          });
        });
      });
    }
  });
}
export function editSession(sessionNum, projectId, change) {
  sessionsDb.find({ num: sessionNum, projectId }, function(err, sessions) {
    if (err) {
      console.log(err);
      return;
    }
    const session = sessions[0];
    const updatedSession = { ...session, change };
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
