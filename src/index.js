import { Project } from "./project";
import { User } from "./user";
import { createEventStore } from "./session";

export const artmadeit = new User("artmadeit");
export const qpdiam = new User("qpdiam");

createEventStore();
const project = new Project("ouracademy");
project.join(artmadeit);
project.join(qpdiam);

const session = project.startNewSession();
session.vote(artmadeit, "111");
session.vote(qpdiam, "111");
session.vote(qpdiam, "112");
session.vote(artmadeit, "112");
session.vote(artmadeit, "121");
session.end();

console.log(session.status.getVotesByCheckpoint());

//  { checkpointId: "111", voters: [artmadeit, qpdiam] },
//   { checkpointId: "112", voters: [qpdiam, artmadeit] },
//   { checkpointId: "121", voters: [artmadeit] }
