#!/usr/bin/env node

const { existsSync } = require("node:fs");
const path = require("node:path");
const { exec } = require("child_process");
const notifier = require("node-notifier");

const cwd = process.cwd();
const gitDir = path.resolve(cwd, ".git");

if (existsSync(gitDir)) {
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

  let needPush = false;
  let loading = false;

  const commit = () =>
    execCommand(
      `git add . && git commit -m "[${new Date().toLocaleString()}] sync"`
    );

  const action = async () => {
    if (loading) return;
    loading = true;

    const result = await execCommand("git status");

    if (
      result.indexOf("modified:") !== -1 ||
      result.indexOf("deleted:") !== -1
    ) {
      needPush = true;
      await commit();
    }

    try {
      const pullRecord = await execCommand("git pull");

      if (pullRecord.indexOf("Updating") !== -1) {
        const [, ...msg] = (
          await execCommand("git log -1 --pretty=oneline")
        ).split(" ");

        notifier.notify({
          title: "Sync successfully to locally",
          message: msg.join(" "),
        });
      }
    } catch (error) {
      console.error("pull failed" + error);
      await commit();
    }

    if (needPush) {
      try {
        await execCommand("git push");
        const [, ...msg] = (
          await execCommand("git log -1 --pretty=oneline")
        ).split(" ");

        notifier.notify({
          title: "Sync successfully to server",
          message: msg.join(" "),
        });
      } catch (error) {
        notifier.notify({
          title: "push failed",
          message: error,
        });
      }

      needPush = false;
    }

    loading = false;
  };

  setInterval(() => {
    action();
  }, 1000);
} else {
  console.warn("sync failed, miss '.git' folder");
}
