class Vote {
  constructor(user, checkpointId, session) {
    this.user = user;
    this.checkpointId = checkpointId;
    this.createdAt = new Date();
    this.session = session;
  }

  get voter() {
    return this.user;
  }
}

export class Session {
  constructor(createdAt, project) {
    this.createdAt = createdAt;
    this.project = project;
    this.previousSession = this.project.currentSession;
    this.totalVotes = this.getTotalVotes();
  }

  getTotalVotes() {
    return this.previousSession ? [...this.previousSession.totalVotes] : [];
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

    this.totalVotes.push(new Vote(user, checkpointId, this));
  }

  removeVote(user, checkpointId) {
    if (this.isFinished) throw "Session is finished, no one can remove a vote";

    this.totalVotes = this.totalVotes.filter(
      x => !(x.user === user && x.checkpointId === checkpointId)
    );
  }

  get voters() {
    return this.totalVotes.map(x => x.user);
  }

  get membersByCheckpoint() {
    return this.totalVotes.reduce((ac, vote) => {
      ac[vote.checkpointId] = ac[vote.checkpointId] || [];
      ac[vote.checkpointId].push(vote);
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
  return array.every(item => {
    const re = anotherArray.findIndex(an => an === item);
    return re !== -1;
  });
};

export const isApprobeForAll = allMembers => checks =>
  containsSameItems(allMembers, checks);

export const evaluatedBy = (state, session) => {
  const votes = session.membersByCheckpoint;
  const votesByState = Object.keys(votes).filter(byState(state.id));

  return votesByState.length === 0
    ? "no-body"
    : containsSameItems(state.checkpoints.map(x => x.id), votesByState) &&
      votesByState.every(stat => {
        const voters = votes[stat].map(x => x.voter);

        return votes[stat].every(vote => {
          return isApprobeForAll(vote.session.members)(voters);
        });
      })
    ? "every-member"
    : "any-member";
};

export const byState = state => checkpoint =>
  state === parseInt(parseInt(checkpoint) / 10);
