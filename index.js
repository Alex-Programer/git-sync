#!/usr/bin/env node

const { existsSync, stat } = require("node:fs");
const path = require("node:path");
const { exec } = require("child_process");
const notifier = require("node-notifier");

const cwd = process.cwd();
const gitDir = path.resolve(cwd, ".git");

if (!existsSync(gitDir)) throw Error("sync failed, miss '.git' folder");

let loading = false;
let lastCommitMsg = "";

const execCommand = (command) => {
  return new Promise((resolve, rejected) => {
    exec(command, { cwd }, (error, stdout) => {
      if (error) {
        rejected(error);
        return;
      }
      resolve(stdout);
    });
  });
};

const sync = async () => {
  const status = await execCommand("git status");

  if (status.indexOf("Changes not staged for commit") !== -1) {
    await execCommand(
      `git add . && git commit -m "[${new Date().toLocaleString()}] sync"`
    );
  }

  await execCommand("git pull");
};

const isClean = async () => {
  const result = await execCommand("git status");
  return result.indexOf("working tree clean") === -1;
};

const action = async () => {
  if (loading) return;
  loading = true;

  try {
    await sync();
    if (await isClean()) return;
    await execCommand("git push");
    const [, ...msg] = (await execCommand("git log -1 --pretty=oneline")).split(
      " "
    );

    const message = msg.join(" ");
    if (lastCommitMsg && lastCommitMsg === message) return;
    lastCommitMsg = message;

    notifier.notify({
      title: "Sync successfully to server",
      message,
    });
  } catch (error) {
    console.log(error);
  }

  loading = false;
};

setInterval(action, 1000);
