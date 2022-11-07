import { existsSync } from "node:fs";
import path from "node:path";
import notifier from "node-notifier";
import { execCommand, getBestNewLog, isClean } from "./utils";
import { DEFAULT_TIME, MessageKey } from "./utils/constant";

const cwd = process.cwd();
const gitDir = path.resolve(cwd, ".git");
if (!existsSync(gitDir)) throw RangeError("sync failed, miss '.git' folder");
const { name: repoName } = require(path.resolve(cwd, "package.json"));

const needCommitStatus = [
  "Changes not staged for commit",
  "Changes to be committed",
  "Untracked files",
];

let loading = false;
let lastCommitMsg = "";
let currentBranchName = "";

const syncToLocal = async () => {
  const status = await execCommand("git status");
  const needCommit = needCommitStatus.some((item) => status.indexOf(item) !== -1);
  needCommit && await execCommand(
    `git add . && git commit -m "[${new Date().toLocaleString()}] sync"`
  );
  await execCommand(`git pull origin ${currentBranchName}`);
};

const syncToServer = async () => {
  if (loading) return;
  loading = true;

  currentBranchName = await execCommand("git branch --show-current");

  try {
    await syncToLocal();
    if (await isClean()) {
      loading = false;
      return;
    }
    await execCommand("git push origin " + currentBranchName);
    const msg = await getBestNewLog();

    const message = msg.join(" ");
    if (lastCommitMsg && lastCommitMsg === message) {
      loading = false;
      return;
    }
    lastCommitMsg = message;

    notifier.notify({
      title: `[${repoName}] Sync successfully to server`,
      message,
    });

    loading = false;
  } catch (error) {
    console.log(error);
  }

  loading = false;
};

process.on('message', data => {
  const time = data === MessageKey.DEFAULT_READY ? DEFAULT_TIME : Number(data) * 1000;
  setInterval(syncToServer.bind(null, time), time);
  if (process.send) {
    process.send(MessageKey.READY);
  } else {
    console.warn('process send api is invalid');
  }
});
