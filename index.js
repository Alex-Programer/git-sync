#!/usr/bin/env node

const { fork } = require("node:child_process");
const path = require("path");

const subProcess = path.resolve(__dirname, "./auto-sync.js");

const subprocess = fork(subProcess, {
  cwd: process.cwd(),
  detached: true,
});

subprocess.unref();
process.exit(1);
