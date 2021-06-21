"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const indent_1 = require("./indent");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let disposable = vscode.commands.registerTextEditorCommand('pythonIndent.newlineAndIndent', indent_1.newlineAndIndent);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map