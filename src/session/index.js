import { VoteEmited, VoteRemoved } from "../Vote";
import { SessionStatus } from "./status";

let voteEventStore;
export const createEventStore = () => {
  voteEventStore = [];
};

export class Session {
  constructor(project) {
    this.createdAt = new Date();
    this.project = project;
    this.previousSession = this.project.currentSession;
  }

  end() {
    this.endDate = new Date();
    this.members = [...this.project.members];
  }

  get isFinished() {
    return !!this.endDate;
  }

  vote(user, checkpointId) {
    if (this.isFinished) throw "Session is finished, no one can vote";
    if (!this.project.members.includes(user))
      throw `Sorry, ${user.name} is not a member`;

    voteEventStore.push(new VoteEmited(user, checkpointId, this));
  }

  removeVote(user, checkpointId) {
    if (this.isFinished) throw "Session is finished, no one can remove a vote";

    voteEventStore.push(new VoteRemoved(user, checkpointId, this));
  }

  get votes() {
    return voteEventStore
      .filter(x => x.createdAt <= this.createdAt)
      .reduce(voteReducer, []);
  }

  get voters() {
    return this.votes.map(x => x.voter);
  }

  get status() {
    return new SessionStatus(this);
  }
}

export const voteReducer = (prevState, action) => {
  switch (action.constructor.name) {
    case VoteEmited.name:
      return [...prevState, action.vote];
    case VoteRemoved.name:
      return prevState.filter(
        x =>
          !(x.voter === action.voter && x.checkpointId === action.checkpointId)
      );
  }
};
