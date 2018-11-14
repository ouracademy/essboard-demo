export class Session {
  constructor(createdAt, project) {
    this.createdAt = createdAt;
    this.project = project;
  }

  end() {
    this.endDate = new Date();
    this.members = this.project.members;
  }

  get isFinished() {
    return !!this.endDate;
  }

  vote(user, checkpointId) {
    if (this.isFinished) throw "Session is finished, no one can vote";
  }
}
