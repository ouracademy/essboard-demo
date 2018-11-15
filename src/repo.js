const Datastore = require("nedb");
export const changesDb = new Datastore({
  filename: "data/changes",
  autoload: true,
  timestampData: true
});
export const projectsDb = new Datastore({
  filename: "data/projects",
  autoload: true,
  timestampData: true
});
export const membersDb = new Datastore({
  filename: "data/members",
  autoload: true,
  timestampData: true
});
export const sessionsDb = new Datastore({
  filename: "data/sessions",
  autoload: true,
  timestampData: true
});
export const eventsDb = new Datastore({
  filename: "data/events",
  autoload: true,
  timestampData: true
});
