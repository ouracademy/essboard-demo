class Vote {
  constructor(user, checkpointId) {
    this.user = user;
    this.checkpointId = checkpointId;
    this.createdAt = new Date();
  }
}

export class Session {
  votes = [];

  constructor(createdAt, project) {
    this.createdAt = createdAt;
    this.project = project;
    this.previousSession = this.project.currentSession;
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
    this.votes.push(new Vote(user, checkpointId));
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

  get totalVotes() {
    if (this.previousSession) {
      return [...this.previousSession.totalVotes, ...this.votes];
    } else {
      return this.votes;
    }
  }

  get membersByCheckpoint() {
    return this.totalVotes.reduce((ac, vote) => {
      ac[vote.checkpointId] = ac[vote.checkpointId] || [];
      ac[vote.checkpointId].push(vote.user);
      return ac;
    }, {});
  }

  alphaStates(alpha) {
    return alpha.states.map(state => ({
      evaluatedBy: evaluatedBy(state, this),
      id: state.id
    }));
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
