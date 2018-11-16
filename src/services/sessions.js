import { sessionRepository } from "../repo";
import { ProjectService } from "./projects";
import { EventService } from "./events";
import { StatusProject } from "../status";

import { getContentFromFile, updateFile } from "../git-client";
import { MemberService } from "./members";
import { kernel } from "../kernel";

export class SessionService {
  static create(projectId, num, createdAt = null) {
    return ProjectService.getLastSnapshot(projectId).then(lastSnapshot => {
      return sessionRepository.insert({
        projectId,
        num,
        snapshot: lastSnapshot,
        endDate: null,
        createdAt
      });
    });
  }

  static getStatus(projectId, sessionNum) {
    return SessionService.find({ num: sessionNum, projectId })
      .then(session => {
        const isFinished = !!session.endDate;
        const snapshotPromise = SessionService.getSnapshot(session.snapshot);
        if (isFinished) {
          return snapshotPromise;
        } else {
          const eventsPromise = EventService.getBySession(
            sessionNum,
            projectId
          );
          const membersPromise = MemberService.find({ projectId });
          return Promise.all([
            snapshotPromise,
            eventsPromise,
            membersPromise
          ]).then(([snapshot, events, members]) => {
            return SessionService.processWithEvents(
              snapshot,
              events,
              members.map(member => member.name)
            );
          });
        }
      })
      .catch(err => console.log(err));
  }

  static getSnapshot(snapshotSHA) {
    return snapshotSHA
      ? getContentFromFile(snapshotSHA)
      : Promise.resolve(null);
  }
  static processWithEvents(initialStatus, events, members) {
    let status = new StatusProject(initialStatus, members);
    status.setEvents(events);
    status.setKernel(kernel);
    return status.getStatus();
  }
  static updateSnapshot(newContent, snapshotSHA, filePath) {
    return updateFile(newContent, snapshotSHA, filePath).then(result => {
      return result["data"]["content"]["sha"];
    });
  }
  static find(query) {
    return sessionRepository.findOne(query);
  }
  static findPopulate(query) {
    return sessionRepository.findOne(query).then(session => {
      return ProjectService.find({ key: query["projectId"] }).then(project => {
        session["project"] = project;
        return session;
      });
    });
  }

  static end(projectId, sessionNum) {
    return SessionService.findPopulate({ num: sessionNum, projectId }).then(
      session => {
        if (session.endDate) {
          throw "The session is already closed";
        } else {
          return SessionService.getStatus(projectId, sessionNum).then(
            status => {
              return SessionService.updateSnapshot(
                status,
                session.project.lastSnapshot,
                session.project.path
              ).then(newSnapshotSHA => {
                return SessionService.markAsClosed(
                  newSnapshotSHA,
                  session._id,
                  session.project._id
                );
              });
            }
          );
        }
      }
    );
  }
  static markAsClosed(newSnapshotSHA, sessionId, projectId) {
    ProjectService.updateLastSnapshot(projectId, newSnapshotSHA);
    SessionService.update(sessionId, {
      endDate: new Date(),
      snapshot: newSnapshotSHA
    });
    return newSnapshotSHA;
  }
  static update(sessionId, change) {
    return sessionRepository.findOne({ _id: sessionId }).then(session => {
      const newSession = { ...session, ...change };
      return sessionRepository.update({ _id: sessionId }, newSession, {});
    });
  }
}
