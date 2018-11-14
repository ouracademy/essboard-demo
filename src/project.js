import { WithName } from "./with-name";
import { Session } from "./session";

export class Project extends WithName {
  members = [];
  sessions = [];

  join(member) {
    if (this.hasMember(member)) throw "Sorry that person is already a member";
    this.members.push(member);
  }

  hasMember(member) {
    return this.members.includes(member);
  }

  removeMember(member) {
    this.members = this.members.filter(x => x !== member);
  }

  get currentSession() {
    return this.sessions[this.sessions.length - 1];
  }

  startNewSession() {
    if (this.sessions.length > 0 && !this.currentSession.isFinished)
      throw "There's already a current that doesn't finished";

    const newSession = new Session(this);
    this.sessions.push(newSession);
    return newSession;
  }
}
