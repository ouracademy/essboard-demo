import { VoteEmited, VoteRemoved } from "../Vote";
import { SessionStatus } from "./status";

export let eventStore;
export let snapshots;

export const createEventStore = () => {
  eventStore = [];
  snapshots = [];
};

export const takeSnapshot = (reducer, timestamp = new Date()) => {
  const snapshot = {
    createdAt: timestamp,
    state: getCurrentState(timestamp, reducer)
  };
  snapshots.push(snapshot);

  return snapshot;
};

const lastSnapshot = date => {
  return snapshots.find(snapshot => {
    return snapshot.createdAt - date <= 0;
  });
};

export const getCurrentState = (date, reducer) => {
  const lastSnap = lastSnapshot(date);

  return (lastSnap
    ? eventStore.filter(
        x => lastSnap.createdAt < x.createdAt && x.createdAt <= date
      )
    : eventStore.filter(x => x.createdAt <= date)
  ).reduce(reducer, lastSnap ? lastSnap.state : []);
};

export const dispatch = item => {
  eventStore.push(item);
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
    takeSnapshot(voteReducer);
  }

  get isFinished() {
    return !!this.endDate;
  }

  vote(user, checkpointId) {
    if (this.isFinished) throw "Session is finished, no one can vote";
    if (!this.project.members.includes(user))
      throw `Sorry, ${user.name} is not a member`;

    dispatch(new VoteEmited(user, checkpointId, this));
  }

  removeVote(user, checkpointId) {
    if (this.isFinished) throw "Session is finished, no one can remove a vote";

    dispatch(new VoteRemoved(user, checkpointId, this));
  }

  get votes() {
    return getCurrentState(
      this.isFinished ? this.endDate : this.createdAt,
      voteReducer
    );
  }

  get voters() {
    return this.status
      .getVotesByCheckpoint()
      .reduce((ac, x) => [...ac, ...x.votes.map(v => v.voter)], []);
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
