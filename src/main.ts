#!/usr/bin/env node

import { fork } from "node:child_process";
import path from "path";
import { record } from "./record";
import { MessageKey } from "./utils/constant";

export const main = () => {
  const childrenProcessFullPath = path.resolve(__dirname, "./auto-sync");
  const cwd = process.cwd();
  const childrenProcess = fork(childrenProcessFullPath, {
    cwd,
    detached: true,
    silent: true,
  });

  const addRecord = async () => {
    if (childrenProcess.pid) {
      const name = path.basename(cwd);
      await record.set({ name, pid: childrenProcess.pid, targetPath: cwd });
    } else {
      throw new Error('process error of miss pid');
    }
  };

  const onMessage = async (data: MessageKey) => {
    if (data === MessageKey.READY) {
      await addRecord();
      await record.print();
      childrenProcess.unref();
      process.exit(1);
    } else {
      throw new Error("unkown message");
    }
  }

  childrenProcess.stderr!.setEncoding("utf-8");
  childrenProcess.stdout!.setEncoding("utf-8");
  childrenProcess.stderr!.on("data", console.error);
  childrenProcess.stdout!.on("data", console.log);
  childrenProcess.on("message", onMessage);
}
