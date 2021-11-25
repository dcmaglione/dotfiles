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
exports.BibLogParser = void 0;
const vscode = __importStar(require("vscode"));
const multiLineWarning = /^Warning--(.+)\n--line (\d+) of file (.+)$/gm;
const singleLineWarning = /^Warning--(.+) in ([^\s]+)\s*$/gm;
const multiLineError = /^(.*)---line (\d+) of file (.*)\n([^]+?)\nI'm skipping whatever remains of this entry$/gm;
const badCrossReference = /^(A bad cross reference---entry ".+?"\nrefers to entry.+?, which doesn't exist)$/gm;
const multiLineCommandError = /^(.*)\n?---line (\d+) of file (.*)\n([^]+?)\nI'm skipping whatever remains of this command$/gm;
const errorAuxFile = /^(.*)---while reading file (.*)$/gm;
class BibLogParser {
    constructor(extension) {
        this.buildLog = [];
        this.compilerDiagnostics = vscode.languages.createDiagnosticCollection('BibTeX');
        this.extension = extension;
    }
    parse(log, rootFile) {
        if (rootFile === undefined) {
            rootFile = this.extension.manager.rootFile;
        }
        if (rootFile === undefined) {
            this.extension.logger.addLogMessage('How can you reach this point?');
            return;
        }
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        let excludeRegexp;
        try {
            excludeRegexp = configuration.get('message.bibtexlog.exclude').map(regexp => RegExp(regexp));
        }
        catch (e) {
            if (e instanceof Error) {
                this.extension.logger.addLogMessage(`latex-workshop.message.bibtexlog.exclude is invalid: ${e.message}`);
            }
            return;
        }
        this.buildLog = [];
        let result;
        while ((result = singleLineWarning.exec(log))) {
            const location = this.findKeyLocation(result[2]);
            if (location) {
                this.pushLog('warning', location.file, result[1], location.line, excludeRegexp);
            }
        }
        while ((result = multiLineWarning.exec(log))) {
            const filename = this.resolveBibFile(result[3], rootFile);
            this.pushLog('warning', filename, result[1], parseInt(result[2], 10), excludeRegexp);
        }
        while ((result = multiLineError.exec(log))) {
            const filename = this.resolveBibFile(result[3], rootFile);
            this.pushLog('error', filename, result[1], parseInt(result[2], 10), excludeRegexp);
        }
        while ((result = multiLineCommandError.exec(log))) {
            const filename = this.resolveBibFile(result[3], rootFile);
            this.pushLog('error', filename, result[1], parseInt(result[2], 10), excludeRegexp);
        }
        while ((result = badCrossReference.exec(log))) {
            this.pushLog('error', rootFile, result[1], 1, excludeRegexp);
        }
        while ((result = errorAuxFile.exec(log))) {
            const filename = this.resolveAuxFile(result[2], rootFile);
            this.pushLog('error', filename, result[1], 1, excludeRegexp);
        }
        this.extension.logger.addLogMessage(`BibTeX log parsed with ${this.buildLog.length} messages.`);
        this.extension.compilerLogParser.showCompilerDiagnostics(this.compilerDiagnostics, this.buildLog, 'BibTeX');
    }
    pushLog(type, file, message, line, excludeRegexp) {
        for (const regexp of excludeRegexp) {
            if (message.match(regexp)) {
                return;
            }
        }
        this.buildLog.push({ type, file, text: message, line });
    }
    resolveAuxFile(filename, rootFile) {
        filename = filename.replace(/\.aux$/, '.tex');
        if (!this.extension.manager.getCachedContent(rootFile)) {
            return filename;
        }
        const texFiles = this.extension.manager.getIncludedTeX(rootFile);
        for (const tex of texFiles) {
            if (tex.endsWith(filename)) {
                return tex;
            }
        }
        this.extension.logger.addLogMessage(`Cannot resolve file while parsing BibTeX log: ${filename}`);
        return filename;
    }
    resolveBibFile(filename, rootFile) {
        if (!this.extension.manager.getCachedContent(rootFile)) {
            return filename;
        }
        const bibFiles = this.extension.manager.getIncludedBib(rootFile);
        for (const bib of bibFiles) {
            if (bib.endsWith(filename)) {
                return bib;
            }
        }
        this.extension.logger.addLogMessage(`Cannot resolve file while parsing BibTeX log: ${filename}`);
        return filename;
    }
    findKeyLocation(key) {
        const entry = this.extension.completer.citation.getEntry(key);
        if (entry) {
            const file = entry.file;
            const line = entry.position.line + 1;
            return { file, line };
        }
        else {
            this.extension.logger.addLogMessage(`Cannot find key when parsing BibTeX log: ${key}`);
            return undefined;
        }
    }
}
exports.BibLogParser = BibLogParser;
//# sourceMappingURL=biblogparser.js.map