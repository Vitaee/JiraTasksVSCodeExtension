const path = require("path");
const cp = require("child_process");
const {
  downloadAndUnzipVSCode,
  resolveCliArgsFromVSCodeExecutablePath,
} = require("@vscode/test-electron");

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "..");
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");

    const vscodeExecutablePath = await downloadAndUnzipVSCode();
    const cliArgs = resolveCliArgsFromVSCodeExecutablePath(
      vscodeExecutablePath
    );
    const [cliPath, ...baseArgs] = cliArgs;

    const args = [
      ...baseArgs,
      `--extensionDevelopmentPath=${extensionDevelopmentPath}`,
      `--extensionTestsPath=${extensionTestsPath}`,
      "--wait",
    ];

    const exitCode = await new Promise((resolve, reject) => {
      const child = cp.spawn(cliPath, args, {
        stdio: "inherit",
        shell: process.platform === "win32",
      });

      child.on("error", reject);
      child.on("exit", (code) => resolve(code ?? 0));
    });

    if (exitCode !== 0) {
      throw new Error(`VS Code exited with code ${exitCode}`);
    }
  } catch (error) {
    console.error("Failed to run VS Code integration tests.");
    console.error(error);
    process.exit(1);
  }
}

main();
