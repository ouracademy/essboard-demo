import { account } from "./config";
const { btoa, atob } = require("abab");
import { githubCredentials } from "./config";
const octokit = require("@octokit/rest")();

octokit.authenticate({
  type: "basic",
  username: githubCredentials.username,
  password: githubCredentials.password
});
export const octoKitAuthenticated = octokit;

// TODO: ask diana unused ?
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

export function createFile(path, content, message) {
  return octoKitAuthenticated.repos.createFile({
    owner: account.owner,
    repo: account.repo,
    path,
    message,
    content: btoa(JSON.stringify(content))
  });
}

export function deleteFile(path, sha, message = "remove file") {
  return octokit.repos
    .deleteFile({
      owner: account.owner,
      repo: account.repo,
      path,
      sha,
      message
    })
    .then(result => {});
}

export function getContentFromFile(file_sha) {
  return octokit.gitdata
    .getBlob({ owner: account.owner, repo: account.repo, file_sha })
    .then(result => {
      const value = JSON.parse(atob(result["data"]["content"]));
      return value;
    })
    .catch(err => console.log(err));
}

export function updateFile(content, sha, path) {
  return octokit.repos.updateFile({
    owner: account.owner,
    repo: account.repo,
    path,
    message: "edit",
    sha,
    content: btoa(JSON.stringify(content))
  });
}
