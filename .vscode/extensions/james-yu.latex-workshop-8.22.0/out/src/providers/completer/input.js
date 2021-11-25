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
exports.SubImport = exports.Import = exports.Input = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const micromatch = __importStar(require("micromatch"));
const utils_1 = require("../../utils/utils");
const ignoreFiles = ['**/.vscode', '**/.vscodeignore', '**/.gitignore'];
class InputAbstract {
    constructor(extension) {
        this.graphicsPath = [];
        this.extension = extension;
    }
    filterIgnoredFiles(files, baseDir) {
        const excludeGlob = (Object.keys(vscode.workspace.getConfiguration('files', null).get('exclude') || {})).concat(vscode.workspace.getConfiguration('latex-workshop').get('intellisense.file.exclude') || []).concat(ignoreFiles);
        return files.filter(file => {
            const filePath = path.resolve(baseDir, file);
            return !micromatch.isMatch(filePath, excludeGlob, { basename: true });
        });
    }
    /**
     * Set the graphics path
     *
     * @param content the content to be parsed for graphicspath
     */
    setGraphicsPath(content) {
        const regex = /\\graphicspath{[\s\n]*((?:{[^{}]*}[\s\n]*)*)}/g;
        const noVerbContent = (0, utils_1.stripCommentsAndVerbatim)(content);
        let result;
        do {
            result = regex.exec(noVerbContent);
            if (result) {
                for (const dir of result[1].split(/\{|\}/).filter(s => s.replace(/^\s*$/, ''))) {
                    if (this.graphicsPath.includes(dir)) {
                        continue;
                    }
                    this.graphicsPath.push(dir);
                }
            }
        } while (result);
    }
    reset() {
        this.graphicsPath = [];
    }
    provideFrom(result, args) {
        const command = result[1];
        const payload = [...result.slice(2).reverse()];
        return this.provide(args.document, args.position, command, payload);
    }
    /**
     * Provide file name intellisense
     *
     * @param payload an array of string
     *      payload[0]: The already typed path
     *      payload[1]: The path from which completion is triggered, may be empty
     */
    provide(document, position, command, payload) {
        const currentFile = document.fileName;
        const typedFolder = payload[0];
        const importFromDir = payload[1];
        const startPos = Math.max(document.lineAt(position).text.lastIndexOf('{', position.character), document.lineAt(position).text.lastIndexOf('/', position.character));
        const range = startPos >= 0 ? new vscode.Range(position.line, startPos + 1, position.line, position.character) : undefined;
        const baseDir = this.getBaseDir(currentFile, importFromDir, command);
        const provideDirOnly = this.provideDirOnly(importFromDir);
        const suggestions = [];
        baseDir.forEach(dir => {
            if (typedFolder !== '') {
                let currentFolder = typedFolder;
                if (!typedFolder.endsWith('/')) {
                    currentFolder = path.dirname(typedFolder);
                }
                dir = path.resolve(dir, currentFolder);
            }
            try {
                let files = fs.readdirSync(dir);
                files = this.filterIgnoredFiles(files, dir);
                files.forEach(file => {
                    const filePath = path.resolve(dir, file);
                    if (dir === '/') {
                        // Keep the leading '/' to have an absolute path
                        file = '/' + file;
                    }
                    if (fs.lstatSync(filePath).isDirectory()) {
                        const item = new vscode.CompletionItem(`${file}/`, vscode.CompletionItemKind.Folder);
                        item.range = range;
                        item.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
                        item.detail = dir;
                        suggestions.push(item);
                    }
                    else if (!provideDirOnly) {
                        const item = new vscode.CompletionItem(file, vscode.CompletionItemKind.File);
                        const preview = vscode.workspace.getConfiguration('latex-workshop').get('intellisense.includegraphics.preview.enabled');
                        if (preview && command === 'includegraphics') {
                            item.documentation = filePath;
                        }
                        item.range = range;
                        item.detail = dir;
                        suggestions.push(item);
                    }
                });
            }
            catch (error) { }
        });
        return suggestions;
    }
}
class Input extends InputAbstract {
    constructor(extension) {
        super(extension);
    }
    provideDirOnly(_importFromDir) {
        return false;
    }
    getBaseDir(currentFile, _importFromDir, command) {
        let baseDir = [];
        if (this.extension.manager.rootDir === undefined) {
            this.extension.logger.addLogMessage(`No root dir can be found. The current root file should be undefined, is ${this.extension.manager.rootFile}. How did you get here?`);
            return [];
        }
        // If there is no root, 'root relative' and 'both' should fall back to 'file relative'
        const rootDir = this.extension.manager.rootDir;
        if (command === 'includegraphics' && this.graphicsPath.length > 0) {
            baseDir = this.graphicsPath.map(dir => path.join(rootDir, dir));
        }
        else {
            const baseConfig = vscode.workspace.getConfiguration('latex-workshop').get('intellisense.file.base');
            const baseDirCurrentFile = path.dirname(currentFile);
            switch (baseConfig) {
                case 'root relative':
                    baseDir = [rootDir];
                    break;
                case 'file relative':
                    baseDir = [baseDirCurrentFile];
                    break;
                case 'both':
                    if (baseDirCurrentFile !== rootDir) {
                        baseDir = [baseDirCurrentFile, rootDir];
                    }
                    else {
                        baseDir = [rootDir];
                    }
                    break;
                default:
            }
        }
        return baseDir;
    }
}
exports.Input = Input;
class Import extends InputAbstract {
    constructor(extension) {
        super(extension);
    }
    provideDirOnly(importFromDir) {
        return (!importFromDir);
    }
    getBaseDir(_currentFile, importFromDir, _command) {
        if (importFromDir) {
            return [importFromDir];
        }
        else {
            return ['/'];
        }
    }
}
exports.Import = Import;
class SubImport extends InputAbstract {
    constructor(extension) {
        super(extension);
    }
    provideDirOnly(importFromDir) {
        return (!importFromDir);
    }
    getBaseDir(currentFile, importFromDir, _command) {
        if (importFromDir) {
            return [path.join(path.dirname(currentFile), importFromDir)];
        }
        else {
            return [path.dirname(currentFile)];
        }
    }
}
exports.SubImport = SubImport;
//# sourceMappingURL=input.js.map