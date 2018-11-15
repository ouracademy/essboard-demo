import { generateKey, Status } from "./util";
import { membersDb, changesDb, projectsDb, sessionsDb, eventsDb } from "./repo";
import { getContentFromFile, updateFile, createFile } from "./git-client";

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

export function createSession(num, projectId) {
  projectsDb.findOne({ key: projectId }, function(err, project) {
    sessionsDb.insert({
      projectId,
      num,
      snapshot: project.lastSnapshot,
      endDate: null
    });
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
      ? getContentFromFile(session.snapshot)
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
    //TODO:  conseguir current session
    const currentSession = 0;
    return eventsDb.find({ session: currentSession, projectId: key }, function(
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
export function endSession(sessionNum, key) {
  sessionsDb.findOne({ num: sessionNum, projectId: key }, function(
    err,
    session
  ) {
    if (session.endDate) {
      throw "The session is already closed";
    }

    projectsDb.findOne({ key }, function(err, project) {
      getStatusBySession(sessionNum, key, status => {
        updateFile(status, project.lastSnapshot, project.path).then(result => {
          const change = result["data"]["content"]["sha"];

          session.endDate = new Date();
          session.snapshot = change;
          sessionsDb.update({ num: sessionNum, projectId: key }, session, {});

          project.lastSnapshot = change;
          project.lastSession = sessionNum;
          projectsDb.update({ key }, project, {});
        });
      });
    });
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
    getContentFromFile(lastChange).then(content => {
      let status = new Status(content);
      status.setEvents(votes);
      updateFile(status.getValue(), lastChange, project["path"])
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
