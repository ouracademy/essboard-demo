const uuidv5 = require("uuid/v5");
const { btoa, atob } = require("abab");
const octokit = require("@octokit/rest")();
octokit.authenticate({
  type: "basic",
  username: "qpdian",
  password: "4942224Tn"
});
export const octoKitAuthenticated = octokit;

import { account } from "./config";

export function generateKey(nameProject) {
  const MY_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";
  return uuidv5(nameProject, MY_NAMESPACE);
}

export function getContentFrom(file_sha) {
  return octokit.gitdata
    .getBlob({ owner: account.owner, repo: account.repo, file_sha })
    .then(result => {
      const value = JSON.parse(atob(result["data"]["content"]));
      return value;
    })
    .catch(err => console.log(err));
}
export function update(content, sha, path) {
  return octokit.repos.updateFile({
    owner: account.owner,
    repo: account.repo,
    path,
    message: "edit",
    sha,
    content: btoa(JSON.stringify(content))
  });
}

export function getCommit(commit_sha) {
  octokit.gitdata
    .getCommit({
      owner: account.owner,
      repo: account.repo,
      commit_sha
    })
    .then(result => {
      console.log(result["data"]);
    })
    .catch(err => console.log(err));
}

export class Status {
  status;
  constructor(status) {
    this.status = status || { states: [] };
  }
  getValue() {
    //calculate here add every nobody
    return this.status;
  }
  setEvents(events) {
    for (let i = 0; i < events.length; i++) {
      const { action, from, stateId, checkPointId, date } = events[i]["event"];
      const { index, state } = this.getState(stateId);
      state.setEvent(action, from, checkPointId, date);
      this.status.states[index] = state.getValue();
    }
  }
  getState(stateId) {
    let index = this.status.states.findIndex(state => state.id === stateId);
    if (index < 0) {
      this.status.states.push({
        status: "no-body",
        checkpoints: [],
        id: stateId
      });
      index = this.status.states.length - 1;
    }
    return { index, state: new State(this.status.states[index]) };
  }
}
export class State {
  value;
  constructor(value) {
    this.value = value;
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
}

const Datastore = require("nedb");
export const changesDb = new Datastore({
  filename: "data/changes",
  autoload: true,
  timestampData: true
});
export const projectsDb = new Datastore({
  filename: "data/projects",
  autoload: true,
  timestampData: true
});
export const membersDb = new Datastore({
  filename: "data/members",
  autoload: true,
  timestampData: true
});
export const sessionsDb = new Datastore({
  filename: "data/sessions",
  autoload: true,
  timestampData: true
});
export const eventsDb = new Datastore({
  filename: "data/events",
  autoload: true,
  timestampData: true
});
