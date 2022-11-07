import fs from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { printTable } from "console-table-printer";

const configPath = path.resolve(__dirname, "../", "config.json");

if (!fs.existsSync(configPath)) {
  fs.writeFile(configPath, "{}", (err) => {
    if (err) throw err;
  });
}

const processRunning = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

const get = async () => {
  const config = await readFile(configPath, "utf-8");
  return JSON.parse(config) as Record<string, { pid: number; name: string; status: string; loop: number | string }>
};

const set = async (item: { targetPath: string; pid: number, name: string, loop: number }) => {
  const config = await get();
  config[item.targetPath] = {
    pid: item.pid,
    name: item.name,
    status: 'online',
    loop: item.loop
  };
  await writeFile(configPath, JSON.stringify(config));
};

const del = async (pid: number) => {
  const config = await get();
  const result: Record<string, { pid: number; name: string; status: string }> = {};

  for (const item in config) {
    if (config[item].pid !== pid) {
      console.log(config[item].pid, pid)
      result[item] = config[item];
    }
  }

  try {
    process.kill(+pid);
  } catch (error) {

  }

  await writeFile(configPath, JSON.stringify(result));
  await print();
};

const print = async () => {
  const config = await get();
  const configTableData = Object.values(config);

  if (configTableData.length) {
    configTableData.forEach(item => {
      item.status = processRunning(item.pid) ? 'online' : 'offline';
      item.loop = ((item.loop as number) / 1000) + 's'
    })
    printTable(configTableData);
  } else {
    console.log('empty task');
  }
}

export const record = {
  get,
  set,
  del,
  print
};
