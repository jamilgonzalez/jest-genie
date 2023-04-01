"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const GenerateFixtures_1 = require("./commands/GenerateFixtures");
const utils_1 = require("./commands/utils");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context) {
    // vscode.commands.executeCommand('setContext', 'Command.GenerateFixtures', true)
    // register generate fixtures command and push to subscriptions
    context.subscriptions.push(vscode.commands.registerCommand(utils_1.Command.GenerateFixtures, async (uri) => await (0, GenerateFixtures_1.generateFixtures)(uri)));
    // create tree view
    vscode.window.createTreeView(utils_1.Command.GenerateFixtures, {
        treeDataProvider: myTreeDataProvider,
    });
    // register tree view
    vscode.window.registerTreeDataProvider(utils_1.Command.GenerateFixtures, myTreeDataProvider);
}
exports.activate = activate;
// tree view
const myTreeDataProvider = {
    getChildren: async (element) => {
        if (!element) {
            return vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
        }
        else {
            return [];
        }
    },
    getTreeItem: (element) => {
        return {
            label: element.fsPath,
            command: {
                command: utils_1.Command.GenerateFixtures,
                title: 'Generate Fixtures GPT',
                arguments: [element],
            },
            contextValue: utils_1.Command.GenerateFixtures,
        };
    },
};
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map