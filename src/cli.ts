#!/usr/bin/env node
import { program } from "commander";
import { main } from "./main";
import { record } from "./record";

program
  .option('ls, --list', 'print task list')
  .option('del, --delete <pid>', 'delete a task')
  .parse(process.argv);

const options = program.opts();
const include = (params: string) => program.args.includes(params);

if (options.list || include('ls')) {
  record.print()
} else if (options.delete || include('del')) {
  const [, pid] = program.args;
  record.del(+pid)
} else {
  main();
}
