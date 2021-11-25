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
exports.FinderUtils = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const utils = __importStar(require("../../utils/utils"));
class FinderUtils {
    constructor(extension) {
        this.extension = extension;
    }
    findRootFromMagic() {
        if (!vscode.window.activeTextEditor) {
            return undefined;
        }
        const regex = /^(?:%\s*!\s*T[Ee]X\sroot\s*=\s*(.*\.(?:tex|[jrsRS]nw|[rR]tex|jtexw))$)/m;
        let content = vscode.window.activeTextEditor.document.getText();
        let result = content.match(regex);
        const fileStack = [];
        if (result) {
            let file = path.resolve(path.dirname(vscode.window.activeTextEditor.document.fileName), result[1]);
            content = this.extension.lwfs.readFileSyncGracefully(file);
            if (content === undefined) {
                const msg = `Not found root file specified in the magic comment: ${file}`;
                this.extension.logger.addLogMessage(msg);
                throw new Error(msg);
            }
            fileStack.push(file);
            this.extension.logger.addLogMessage(`Found root file by magic comment: ${file}`);
            result = content.match(regex);
            while (result) {
                file = path.resolve(path.dirname(file), result[1]);
                if (fileStack.includes(file)) {
                    this.extension.logger.addLogMessage(`Looped root file by magic comment found: ${file}, stop here.`);
                    return file;
                }
                else {
                    fileStack.push(file);
                    this.extension.logger.addLogMessage(`Recursively found root file by magic comment: ${file}`);
                }
                content = this.extension.lwfs.readFileSyncGracefully(file);
                if (content === undefined) {
                    const msg = `Not found root file specified in the magic comment: ${file}`;
                    this.extension.logger.addLogMessage(msg);
                    throw new Error(msg);
                }
                result = content.match(regex);
            }
            return file;
        }
        return undefined;
    }
    findSubFiles(content) {
        if (!vscode.window.activeTextEditor) {
            return undefined;
        }
        const regex = /(?:\\documentclass\[(.*)\]{subfiles})/;
        const result = content.match(regex);
        if (result) {
            const file = utils.resolveFile([path.dirname(vscode.window.activeTextEditor.document.fileName)], result[1]);
            if (file) {
                this.extension.logger.addLogMessage(`Found root file of this subfile from active editor: ${file}`);
            }
            else {
                this.extension.logger.addLogMessage(`Cannot find root file of this subfile from active editor: ${result[1]}`);
            }
            return file;
        }
        return undefined;
    }
}
exports.FinderUtils = FinderUtils;
//# sourceMappingURL=finderutils.js.map