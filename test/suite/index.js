const path = require("path");
const fs = require("fs");
const Mocha = require("mocha");

function loadTestFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...loadTestFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".e2e.js")) {
      files.push(fullPath);
    }
  }

  return files;
}

function run() {
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname);
  for (const file of loadTestFiles(testsRoot)) {
    mocha.addFile(file);
  }

  return new Promise((resolve, reject) => {
    try {
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
          return;
        }
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { run };
