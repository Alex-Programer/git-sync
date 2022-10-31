#!/usr/bin/env node

const { fork } = require("node:child_process");
const path = require("path");

const subProcess = path.resolve(__dirname, "./auto-sync.js");

const children = fork(subProcess, {
  cwd: process.cwd(),
  detached: true,
  silent: true,
});

children.stderr.setEncoding("utf-8");
children.stderr.on("data", function (error) {
  console.error(error);
});

children.on("message", (data) => {
  if (data === "ready") {
    children.unref();
    process.exit(1);
  } else {
    throw new Error("unkown error for message");
  }
});
