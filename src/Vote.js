export class Vote {
  constructor(user, checkpointId, session) {
    this.voter = user;
    this.checkpointId = checkpointId;
    this.createdAt = new Date();
    this.session = session;
  }
}
