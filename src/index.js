"use strict";
import { createProject, addMember, addVotes } from "./use-cases";

//createProject("diana", "essboard");
addMember("ebaf9c40-8b87-5ef6-9dd8-1d978b321d6e", "arthur");
addVotes(
  "ebaf9c40-8b87-5ef6-9dd8-1d978b321d6e",
  [
    { from: "diana", stateId: 11, checkPointId: 111, date: new Date() },
    { from: "arthur", stateId: 11, checkPointId: 111, date: new Date() },
    { from: "diana", stateId: 11, checkPointId: 112, date: new Date() },
    { from: "arthur", stateId: 11, checkPointId: 112, date: new Date() }
  ],
  1
);
