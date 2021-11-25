"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeXMagician = void 0;
const vscode = __importStar(require("vscode"));
const os_1 = require("os");
const path = __importStar(require("path"));
class TeXMagician {
    constructor(extension) {
        this.extension = extension;
    }
    getFileName(file) {
        const segments = file.replace(/\\/g, '/').match(/([^/]+$)/);
        if (segments) {
            return segments[0];
        }
        return '';
    }
    addTexRoot() {
        // taken from here: https://github.com/DonJayamanne/listFilesVSCode/blob/master/src/extension.ts (MIT licensed, should be fine)
        void vscode.workspace.findFiles('**/*.{tex}').then(files => {
            const displayFiles = files.map(file => {
                return { description: file.fsPath, label: this.getFileName(file.fsPath), filePath: file.fsPath };
            });
            void vscode.window.showQuickPick(displayFiles).then(val => {
                const editor = vscode.window.activeTextEditor;
                if (!(val && editor)) {
                    return;
                }
                const relativePath = path.relative(path.dirname(editor.document.fileName), val.filePath);
                const magicComment = `% !TeX root = ${relativePath}`;
                const line0 = editor.document.lineAt(0).text;
                const edits = [(line0.match(/^\s*%\s*!TeX root/gmi)) ?
                        vscode.TextEdit.replace(new vscode.Range(0, 0, 0, line0.length), magicComment)
                        :
                            vscode.TextEdit.insert(new vscode.Position(0, 0), magicComment + os_1.EOL)
                ];
                // Insert the text
                const uri = editor.document.uri;
                const edit = new vscode.WorkspaceEdit();
                edit.set(uri, edits);
                void vscode.workspace.applyEdit(edit);
            });
        });
    }
}
exports.TeXMagician = TeXMagician;
//# sourceMappingURL=texmagician.js.map