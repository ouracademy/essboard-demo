const Datastore = require("nedb-promises");
export const projectRepository = Datastore.create({
  filename: "data/projects",
  autoload: true,
  timestampData: true
});
export const memberRepository = Datastore.create({
  filename: "data/members",
  autoload: true,
  timestampData: true
});
export const sessionRepository = Datastore.create({
  filename: "data/sessions",
  autoload: true,
  timestampData: true
});
export const eventRepository = Datastore.create({
  filename: "data/events",
  autoload: true,
  timestampData: true
});
