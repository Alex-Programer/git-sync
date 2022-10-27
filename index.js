#!/usr/bin/env node

const { existsSync } = require("node:fs");
const path = require("node:path");
const { exec } = require("child_process");
const notifier = require("node-notifier");

const cwd = process.cwd();
const gitDir = path.resolve(cwd, ".git");

if (!existsSync(gitDir)) throw Error("sync failed, miss '.git' folder");

const execCommand = (command) => {
  return new Promise((resolve, rejected) => {
    exec(command, { cwd }, (error, stdout) => {
      if (error) {
        rejected(`error: ${error.message}`);
        return;
      }
      resolve(stdout);
    });
  });
};

const sync = () =>
  execCommand(
    `git add . && git commit -m "[${new Date().toLocaleString()}] sync" && git pull --rebase`
  );

const isClean = async () => {
  const result = await execCommand("git status");
  return result.indexOf("working tree clean") !== -1;
};

const action = async () => {
  try {
    await sync();
    if (await isClean()) return;
    await execCommand("git push");
    const [, ...msg] = (await execCommand("git log -1 --pretty=oneline")).split(
      " "
    );
    notifier.notify({
      title: "Sync successfully to locally",
      message: msg.join(" "),
    });
  } catch (error) {
    console.log(error);
  }
};

setInterval(action, 1000);
