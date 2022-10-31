const { existsSync } = require("node:fs");
const path = require("node:path");
const { exec } = require("child_process");
const notifier = require("node-notifier");

const cwd = process.cwd();
const gitDir = path.resolve(cwd, ".git");

const { name } = require(path.resolve(cwd, "package.json"));
if (!existsSync(gitDir)) throw Error("sync failed, miss '.git' folder");

let loading = false;
let lastCommitMsg = "";
let branchName = "";

const execCommand = (command) => {
  return new Promise((resolve, rejected) => {
    exec(command, { cwd, windowsHide: true }, (error, stdout) => {
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

  const allowCommit = [
    "Changes not staged for commit",
    "Changes to be committed",
  ];

  if (allowCommit.some((item) => status.indexOf(item) !== -1)) {
    await execCommand(
      `git add . && git commit -m "[${new Date().toLocaleString()}] sync"`
    );
  }

  await execCommand("git pull origin " + branchName);
};

const isClean = async () => {
  const result = await execCommand("git status");
  return result.indexOf("working tree clean") === -1;
};

const action = async () => {
  if (loading) return;
  loading = true;

  branchName = await execCommand("git branch --show-current");

  try {
    await sync();
    if (await isClean()) {
      loading = false;
      return;
    }
    await execCommand("git push origin " + branchName);
    const [, ...msg] = (await execCommand("git log -1 --pretty=oneline")).split(
      " "
    );

    const message = msg.join(" ");
    if (lastCommitMsg && lastCommitMsg === message) {
      loading = false;
      return;
    }
    lastCommitMsg = message;

    notifier.notify({
      title: `[${name}] Sync successfully to server`,
      message,
    });
  } catch (error) {
    console.log(error);
  }

  loading = false;
};

setInterval(action, 1000);
