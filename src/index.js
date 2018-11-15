"use strict";
import { createProject, addMember, addEvent } from "./use-cases";
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
  }
];
createProject("diana", "intento1").then(projectId => {
  addMember("ebaf9c40-8b87-5ef6-9dd8-1d978b321d6e", "arthur");
  createSession(1, projectId);
  votes.forEach(vote => {
    const { action, from, checkPointId, state, date } = vote;
    addEvent(1, projectId, { action, from, checkPointId, state, date });
  });
  getStatusBySession(1, projectId);
  endSession(1, projectId);
});
