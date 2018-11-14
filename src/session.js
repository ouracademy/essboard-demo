import { artmadeit, qpdiam } from "./project.spec";

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

  get membersByCheckpoint() {
    return this.votes.reduce((ac, vote) => {
      ac[vote.checkpointId] = ac[vote.checkpointId] || [];
      ac[vote.checkpointId].push(vote.user);
      return ac;
    }, {});
  }
}

const containsSameItems = (array, anotherArray) => {
  const res = array.every(item => {
    const re = anotherArray.findIndex(an => an === item);
    return re !== -1;
  });
  return res;
};

export const isApprobeForAll = allMembers => checks =>
  containsSameItems(allMembers, checks);

export const evaluatedBy = (state, session) => {
  const votes = session.membersByCheckpoint;
  const votesByState = Object.keys(votes).filter(byState(state.id));

  return votesByState.length === 0
    ? "no-body"
    : containsSameItems(state.checkpoints.map(x => x.id), votesByState) &&
      votesByState.every(x => isApprobeForAll(session.members)(votes[x]))
    ? "every-member"
    : "any-member";
};

export const byState = state => checkpoint =>
  state === parseInt(parseInt(checkpoint) / 10);
