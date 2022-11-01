#!/usr/bin/env node
const { program } = require("commander");

program
  .option("-d, --debug", "output extra debugging")
  .option("-s, --small", "small pizza size")
  .option("-p, --pizza-type <type>", "flavour of pizza");

program.parse(process.argv);

const options = program.opts();
if (options.debug) console.log(options);
console.log("pizza details:");
if (options.small) console.log("- small pizza size");
if (options.pizzaType) console.log(`- ${options.pizzaType}`);

// const { fork } = require("node:child_process");
// const path = require("path");

// const MainProcess = path.resolve(__dirname, "./main.js");
// const main = fork(MainProcess, {
//   cwd: process.cwd(),
//   detached: true,
// });

// main.unref();
// process.exit(1);
