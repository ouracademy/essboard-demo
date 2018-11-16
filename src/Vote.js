// Notice events are also commands
class VoteEvent {
  constructor(user, checkpointId, session) {
    this.voter = user;
    this.checkpointId = checkpointId;
    this.createdAt = new Date();
    this.session = session;
  }

  get vote() {
    return {
      voter: this.voter,
      createdAt: this.createdAt,
      session: this.session,
      checkpointId: this.checkpointId
    };
  }
}

export class VoteEmited extends VoteEvent {
  type = "VOTE_EMITED";
}

export class VoteRemoved extends VoteEvent {
  type = "VOTE_REMOVED";
}
