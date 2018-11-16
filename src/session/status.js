import { toArray, containsSameItems } from "../array";
import groupBy from "lodash/fp/groupBy";

export class SessionStatus {
  constructor(session) {
    this.session = session;
  }
  getVotesByCheckpoint(state) {
    const votes = state
      ? this.session.votes.filter(vote => byState(state.id)(vote.checkpointId))
      : this.session.votes;
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

export const byState = state => checkpoint =>
  state === parseInt(parseInt(checkpoint) / 10);

export const evaluatedBy = (state, sessionStatus) => {
  const votesByCheckpoint = sessionStatus.getVotesByCheckpoint(state);

  return votesByCheckpoint.map(x => x.checkpointId).length === 0
    ? "no-body"
    : evaluatedByEveryMember(state, votesByCheckpoint)
    ? "every-member"
    : "any-member";
};

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

export const isApprobeForAll = allMembers => checks =>
  containsSameItems(allMembers, checks);
