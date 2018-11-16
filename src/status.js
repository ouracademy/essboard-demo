import { containsSameItems } from "./array";
export class StatusProject {
  status;
  members = [];
  constructor(status, members = []) {
    this.members = members;
    this.status = status || { states: [] };
    this.stateTemplateByState = {};
  }
  setKernel(kernel) {
    this.stateTemplateByState = kernel.alphas.reduce((acc, current) => {
      current.states.forEach(state => {
        acc[state.id] = state;
      });
      return acc;
    }, {});
  }

  getStateTemplate(stateId) {
    const id = String(stateId);
    return this.stateTemplateByState[id];
  }
  getStatus() {
    return this.status.states.map(state => {
      return {
        id: state.id,
        approbeFor: state.getProcessedValue(this.stateTemplateByState[state.id])
      };
    });
  }
  getStatusByAlpha(alphaId) {
    return this.status.states
      .filter(state => byAlpha(alphaId)(state.id))
      .map(state => {
        return {
          id: state.id,
          approbeFor: state.getProcessedValue(
            this.stateTemplateByState[state.id]
          )
        };
      });
  }

  setEvents(events) {
    for (let i = 0; i < events.length; i++) {
      const { action, from, stateId, checkPointId, date } = events[i]["event"];
      const { index, state } = this.getState(stateId);
      state.setEvent(action, from, checkPointId, date);
      this.status.states[index] = state;
    }
  }
  getState(stateId) {
    let index = this.status.states.findIndex(state => state.id === stateId);
    if (index < 0) {
      this.status.states.push(
        new State({
          status: "no-body",
          checkpoints: [],
          id: stateId
        })
      );
      index = this.status.states.length - 1;
    }
    return { index, state: this.status.states[index] };
  }
}
export class State {
  value;
  constructor(value) {
    this.value = value;
  }

  get id() {
    return this.value["id"];
  }
  getValue() {
    return this.value;
  }
  setEvent(action, from, checkpointId, date) {
    const index = this.value.checkpoints.findIndex(
      check => check.id === checkpointId
    );
    //arreglar esto
    if (index >= 0) {
      if (
        this.value.checkpoints[index].voters.find(
          vote => vote.voter === from
        ) &&
        action === "add"
      ) {
        return;
      }
      if (action === "remove") {
        this.value.checkpoints[index].voters = this.value.checkpoints[
          index
        ].voters.filter(vote => vote.voter !== from);
      } else {
        this.value.checkpoints[index].voters.push({
          voter: from,
          date
        });
      }
    } else {
      if (action === "remove") return;
      this.value.checkpoints.push({
        id: checkpointId,
        voters: [{ voter: from, date }]
      });
    }
  }

  getProcessedValue(stateTemplate) {
    const votesByCheckpoint = this.value.checkpoints;

    return votesByCheckpoint.map(x => x.id).length === 0
      ? "no-body"
      : this.evaluatedByEveryMember(votesByCheckpoint, stateTemplate)
      ? "every-member"
      : "any-member";
  }

  evaluatedByEveryMember(votesByCheckpoint, stateTemplate) {
    return (
      containsSameItems(
        stateTemplate.checkpoints.map(x => x.id),
        votesByCheckpoint.map(x => x.id)
      ) &&
      votesByCheckpoint
        .map(x => x.voters)
        .every(voters => {
          const votersId = voters.map(x => x.voter);
          return this.isApprobeForAll(votersId);
        })
    );
  }
  isApprobeForAll(checks) {
    return containsSameItems(this.members, checks);
  }
}

export const byState = state => checkpoint =>
  state === parseInt(parseInt(checkpoint) / 10);

export const byAlpha = alpha => state =>
  alpha === parseInt(parseInt(state) / 10);
