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
      console.log(JSON.stringify(value));
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
    this.status = status;
  }
  getValue() {
    return this.status;
  }
  addVotes(votes) {
    for (let i = 0; i < votes.length; i++) {
      const { from, stateId, checkPointId, date } = votes[i];
      const { index, state } = this.getState(stateId);
      state.addVote(from, checkPointId, date);
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
  removeVote(from, stateId, checkPointId, date) {}
}
export class State {
  value;
  constructor(value) {
    this.value = value;
  }
  getValue() {
    return this.value;
  }
  addVote(from, checkpointId, date) {
    const check = this.value.checkpoints.find(
      check => check.voter === from && check.id === checkpointId
    );
    if (check) return;
    this.value.checkpoints.push({
      voter: from,
      id: checkpointId,
      date
    });
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
