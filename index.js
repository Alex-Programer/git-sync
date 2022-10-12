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

    if (result.indexOf("modified:") !== -1 || result.indexOf("deleted:") !== -1) {
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
          title: "已同步至本地",
          message: msg.join(" "),
        });
      }
    } catch (error) {
      console.error("pull 失败" + error);
      await commit();
    }

    if (needPush) {
      try {
        await execCommand("git push");
        const [, ...msg] = (
          await execCommand("git log -1 --pretty=oneline")
        ).split(" ");

        notifier.notify({
          title: "同步至仓库",
          message: msg.join(" "),
        });
      } catch (error) {
        notifier.notify({
          title: "push 失败",
          message: error,
        });
      }

      needPush = false;
    }

    loading = false;
  };

  setInterval(action, 1000);
} else {
  console.warn("同步失败，缺少 .git 目录");
}
