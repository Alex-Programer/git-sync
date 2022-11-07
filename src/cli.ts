#!/usr/bin/env node
import { program } from "commander";
import { main } from "./main";
import { record } from "./record";
import { DEFAULT_TIME } from "./utils/constant";

program
  .option('ls, --list', 'print task list')
  .option('l, --loop <loop>', `Synchronization time(unit: second). Default ${DEFAULT_TIME / DEFAULT_TIME}s`)
  .option('del, --delete <pid>', 'delete a task')
  .parse(process.argv);

const options = program.opts();
const include = (params: string) => program.args.includes(params);

if (options.list || include('ls')) {
  record.print()
} else if (options.loop || include('l')) {
  const [, loop] = program.args;
  if (!loop || isNaN(+loop)) throw TypeError('loop must be number');
  main(+loop);
} else if (options.delete || include('del')) {
  const [, pid] = program.args;
  record.del(+pid)
} else {
  main();
}
