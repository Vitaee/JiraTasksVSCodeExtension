const assert = require("assert");
const vscode = require("vscode");
const packageJson = require("../../package.json");

suite("Jira Tasks Extension", () => {
  test("registers extension commands", async () => {
    const extensionId = `${packageJson.publisher}.${packageJson.name}`;
    const extension = vscode.extensions.getExtension(extensionId);

    assert.ok(extension, `Extension ${extensionId} not found.`);

    await extension.activate();

    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes("jiraTasks.generate"));
    assert.ok(commands.includes("jiraTasks.setOpenRouterKey"));
    assert.ok(commands.includes("jiraTasks.setGroqKey"));
  });
});
