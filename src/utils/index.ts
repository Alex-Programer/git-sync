import { exec } from "child_process";

const cwd = process.cwd();

export const execCommand = (command: string): Promise<string> => {
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

export const isClean = async () => {
  const result = await execCommand("git status");
  return result.indexOf("working tree clean") === -1;
};

export const getBestNewLog = async () => {
  const [, ...msg] = (await execCommand("git log -1 --pretty=oneline")).split(
    " "
  );
  return msg;
};
