import { containsSameItems } from "./array";
import { Vote } from "./Vote";

export class Session {
  constructor(project) {
    this.createdAt = new Date();
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
      x => !(x.voter === user && x.checkpointId === checkpointId)
    );
  }

  get voters() {
    return this.totalVotes.map(x => x.voter);
  }

  getVotesByCheckpoint(state) {
    const votes = state
      ? this.totalVotes.filter(vote => byState(state.id)(vote.checkpointId))
      : this.totalVotes;

    return votes.reduce((ac, vote) => {
      const index = ac.findIndex(x => x.checkpointId === vote.checkpointId);

      if (index !== -1) {
        ac[index].votes.push(vote);
      } else {
        ac.push({
          checkpointId: vote.checkpointId,
          votes: [vote]
        });
      }

      return ac;
    }, []);
  }

  alphaStates(alpha) {
    return alpha.states.map(state => ({
      evaluatedBy: evaluatedBy(state, this),
      id: state.id
    }));
  }
}

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
