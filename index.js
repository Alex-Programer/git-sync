#!/usr/bin/env node
const { program } = require("commander");

program
  .option("-l, --list", "show sync list")
  .option("-d, --delete", "delete a sync task");
program.parse(process.argv);

const options = program.opts();
if (options.list) console.log("123");

// const { fork } = require("node:child_process");
// const path = require("path");

// const MainProcess = path.resolve(__dirname, "./main.js");
// const main = fork(MainProcess, {
//   cwd: process.cwd(),
//   detached: true,
// });

// main.unref();
// process.exit(1);
