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
exports.SurroundCommand = void 0;
const vscode = __importStar(require("vscode"));
class SurroundCommand {
    surround(cmdItems) {
        if (!vscode.window.activeTextEditor) {
            return;
        }
        const editor = vscode.window.activeTextEditor;
        const candidate = [];
        cmdItems.forEach(item => {
            if (item.insertText === undefined) {
                return;
            }
            if (item.label === '\\begin') { // Causing a lot of trouble
                return;
            }
            const command = (typeof item.insertText !== 'string') ? item.insertText.value : item.insertText;
            if (command.match(/(.*)(\${\d.*?})/)) {
                const commandStr = command.replace('\\\\', '\\').replace(':${TM_SELECTED_TEXT}', '');
                candidate.push({
                    command: commandStr,
                    detail: '\\' + commandStr.replace(/[\n\t]/g, '').replace(/\$\{(\d+)\}/g, '$$$1'),
                    label: item.label
                });
            }
        });
        void vscode.window.showQuickPick(candidate, {
            placeHolder: 'Press ENTER to surround previous selection with selected command',
            matchOnDetail: false,
            matchOnDescription: false
        }).then(selected => {
            if (selected === undefined) {
                return;
            }
            void editor.edit(editBuilder => {
                for (const selection of editor.selections) {
                    const selectedContent = editor.document.getText(selection);
                    const selectedCommand = '\\' + selected.command;
                    editBuilder.replace(new vscode.Range(selection.start, selection.end), selectedCommand.replace(/(.*)(\${\d.*?})/, `$1${selectedContent}`) // Replace text
                        .replace(/\${\d:?(.*?)}/g, '$1') // Remove snippet placeholders
                        .replace(/\$\d/, '')); // Remove $2 etc
                }
            });
        });
        return;
    }
}
exports.SurroundCommand = SurroundCommand;
//# sourceMappingURL=surround.js.map