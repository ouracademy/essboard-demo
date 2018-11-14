export class Session {
  votes = [];

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
    this.votes.push({ user, checkpointId, createdAt: new Date() });
  }

  removeVote(user, checkpointId) {
    if (this.isFinished) throw "Session is finished, no one can remove a vote";

    this.votes = this.votes.filter(
      x => !(x.user === user && x.checkpointId === checkpointId)
    );
  }

  get voters() {
    return this.votes.map(x => x.user);
  }
}
