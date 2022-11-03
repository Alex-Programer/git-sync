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

const get = async () => {
  const config = await readFile(configPath, "utf-8");
  return JSON.parse(config);
};

const set = async (item: { targetPath: string; pid: number, name: string }) => {
  const config = await get();
  config[item.targetPath] = {
    pid: item.pid,
    name: item.name,
    status: 'online'
  };
  await writeFile(configPath, JSON.stringify(config));
};

const del = async (targetPath: string) => {
  const config = await get();
  const result: Record<string, string> = {};

  for (const item in config) {
    if (targetPath !== item) {
      result[item] = config[item];
    }
  }

  await writeFile(configPath, JSON.stringify(result));
};

const print = async () => {
  const config = await get();
  const configTableData = Object.values(config);
  printTable(configTableData);
}

export const record = {
  get,
  set,
  del,
  print
};
