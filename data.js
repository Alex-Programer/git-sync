const fs = require("fs");
const { readFile, writeFile } = require("fs/promises");
const path = require("path");

const configPath = path.resolve(__dirname, "config.json");

if (!fs.existsSync(configPath)) {
  fs.writeFile(configPath, "{}", (err) => {
    if (err) throw err;
  });
}

const get = async () => {
  const config = await readFile(configPath, "utf-8");
  return JSON.parse(config);
};

const set = async (targetPath) => {
  const config = await get();
  config[targetPath] = {
    createTime: new Date(),
  };
  await writeFile(configPath, JSON.stringify(config));
};

const del = async (targetPath) => {
  const config = await get();
  const result = {};

  for (const item in config) {
    if (targetPath !== item) {
      result[item] = config[item];
    }
  }

  await writeFile(configPath, JSON.stringify(result));
};

module.exports = {
  get,
  set,
  del,
};
