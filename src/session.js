import { containsSameItems, toArray } from "./array";
import { VoteEmited, VoteRemoved } from "./Vote";
import groupBy from "lodash/fp/groupBy";

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

  getVotesByCheckpoint(state) {
    const votes = state
      ? this.votes.filter(vote => byState(state.id)(vote.checkpointId))
      : this.votes;

    return toArray("checkpointId", groupBy(x => x.checkpointId)(votes))(
      "votes"
    );
  }

  alphaStates(alpha) {
    return alpha.states.map(state => ({
      evaluatedBy: evaluatedBy(state, this),
      id: state.id
    }));
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

export const isApprobeForAll = allMembers => checks =>
  containsSameItems(allMembers, checks);

export const evaluatedBy = (state, session) => {
  const votesByCheckpoint = session.getVotesByCheckpoint(state);

  return votesByCheckpoint.map(x => x.checkpointId).length === 0
    ? "no-body"
    : evaluatedByEveryMember(state, votesByCheckpoint)
    ? "every-member"
    : "any-member";
};

export const byState = state => checkpoint =>
  state === parseInt(parseInt(checkpoint) / 10);

const evaluatedByEveryMember = (state, votesByCheckpoint) => {
  return (
    containsSameItems(
      state.checkpoints.map(x => x.id),
      votesByCheckpoint.map(x => x.checkpointId)
    ) &&
    votesByCheckpoint
      .map(x => x.votes)
      .every(votes => {
        const voters = votes.map(x => x.voter);
        return votes.every(vote =>
          isApprobeForAll(vote.session.members)(voters)
        );
      })
  );
};
