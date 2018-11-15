"use strict";
import {
  createProject,
  addMember,
  addEvent,
  createSession,
  getStatusBySession,
  endSession
} from "./use-cases";
const votes = [
  {
    action: "add",
    from: "diana",
    stateId: 11,
    checkPointId: 111,
    date: new Date()
  },
  {
    action: "add",
    from: "arthur",
    stateId: 11,
    checkPointId: 111,
    date: new Date()
  },
  {
    action: "add",
    from: "diana",
    stateId: 11,
    checkPointId: 112,
    date: new Date()
  },
  {
    action: "add",
    from: "arthur",
    stateId: 11,
    checkPointId: 112,
    date: new Date()
  },
  {
    action: "remove",
    from: "arthur",
    stateId: 11,
    checkPointId: 112,
    date: new Date()
  }
];

createProject("diana", "intento23").then(projectId => {
  addMember(projectId, "arthur");
  createSession(1, projectId);
  votes.forEach(vote => {
    const { action, from, checkPointId, stateId, date } = vote;
    addEvent(1, projectId, { action, from, checkPointId, stateId, date });
  });
  getStatusBySession(1, projectId, status => {
    console.log(status);
  });
  endSession(1, projectId);
  getStatusBySession(1, projectId, status => {
    console.log(status);
  });
});
