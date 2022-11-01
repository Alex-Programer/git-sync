#!/usr/bin/env node

const { fork } = require("node:child_process");
const path = require("path");

const MainProcess = path.resolve(__dirname, "./main.js");

const main = fork(MainProcess, {
  cwd: process.cwd(),
  detached: true,
});

main.unref();
process.exit(1);
