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
exports.LinterLogParser = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const convertfilename_1 = require("../../utils/convertfilename");
const DIAGNOSTIC_SEVERITY = {
    'typesetting': vscode.DiagnosticSeverity.Information,
    'warning': vscode.DiagnosticSeverity.Warning,
    'error': vscode.DiagnosticSeverity.Error,
};
class LinterLogParser {
    constructor(extension) {
        this.linterDiagnostics = vscode.languages.createDiagnosticCollection('ChkTeX');
        this.extension = extension;
    }
    parse(log, singleFileOriginalPath, tabSizeArg) {
        const re = /^(.*?):(\d+):(\d+):(\d+):(.*?):(\d+):(.*?)$/gm;
        const linterLog = [];
        let match = re.exec(log);
        while (match) {
            // This log may be for a single file in memory, in which case we override the
            // path with what is provided
            let filePath = singleFileOriginalPath ? singleFileOriginalPath : match[1];
            if (!path.isAbsolute(filePath) && this.extension.manager.rootDir !== undefined) {
                filePath = path.resolve(this.extension.manager.rootDir, filePath);
            }
            const line = parseInt(match[2]);
            const column = this.callConvertColumn(parseInt(match[3]), filePath, line, tabSizeArg);
            linterLog.push({
                file: filePath,
                line,
                column,
                length: parseInt(match[4]),
                type: match[5].toLowerCase(),
                code: parseInt(match[6]),
                text: `${match[6]}: ${match[7]}`
            });
            match = re.exec(log);
        }
        this.extension.logger.addLogMessage(`Linter log parsed with ${linterLog.length} messages.`);
        if (singleFileOriginalPath === undefined) {
            // A full lint of the project has taken place - clear all previous results.
            this.linterDiagnostics.clear();
        }
        else if (linterLog.length === 0) {
            // We are linting a single file and the new log is empty for it -
            // clean existing records.
            this.linterDiagnostics.set(vscode.Uri.file(singleFileOriginalPath), []);
        }
        this.showLinterDiagnostics(linterLog);
    }
    callConvertColumn(column, filePathArg, line, tabSizeArg) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (!configuration.get('chktex.convertOutput.column.enabled', true)) {
            return column;
        }
        const filePath = (0, convertfilename_1.convertFilenameEncoding)(filePathArg);
        if (!filePath) {
            this.extension.logger.addLogMessage(`Stop converting chktex's column numbers. File not found: ${filePathArg}`);
            return column;
        }
        const lineString = fs.readFileSync(filePath).toString().split('\n')[line - 1];
        let tabSize;
        const tabSizeConfig = configuration.get('chktex.convertOutput.column.chktexrcTabSize', -1);
        if (tabSizeConfig >= 0) {
            tabSize = tabSizeConfig;
        }
        else {
            tabSize = tabSizeArg;
        }
        if (lineString === undefined) {
            this.extension.logger.addLogMessage(`Stop converting chktex's column numbers. Invalid line number: ${line}`);
            return column;
        }
        return this.convertColumn(column, lineString, tabSize);
    }
    /**
     * @param colArg One-based value.
     * @param tabSize The default value used by chktex is 8.
     * @returns One-based value.
     */
    convertColumn(colArg, lineString, tabSize = 8) {
        const col = colArg - 1;
        const charByteArray = lineString.split('').map((c) => Buffer.byteLength(c));
        let i = 0;
        let pos = 0;
        while (i < charByteArray.length) {
            if (col <= pos) {
                break;
            }
            if (lineString[i] === '\t') {
                pos += tabSize;
            }
            else {
                pos += charByteArray[i];
            }
            i += 1;
        }
        return i + 1;
    }
    showLinterDiagnostics(linterLog) {
        const diagsCollection = Object.create(null);
        for (const item of linterLog) {
            const range = new vscode.Range(new vscode.Position(item.line - 1, item.column - 1), new vscode.Position(item.line - 1, item.column - 1 + item.length));
            const diag = new vscode.Diagnostic(range, item.text, DIAGNOSTIC_SEVERITY[item.type]);
            diag.code = item.code;
            diag.source = 'ChkTeX';
            if (diagsCollection[item.file] === undefined) {
                diagsCollection[item.file] = [];
            }
            diagsCollection[item.file].push(diag);
        }
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const convEnc = configuration.get('message.convertFilenameEncoding');
        for (const file in diagsCollection) {
            let file1 = file;
            if (['.tex', '.bbx', '.cbx', '.dtx'].includes(path.extname(file))) {
                // Only report ChkTeX errors on TeX files. This is done to avoid
                // reporting errors in .sty files, which are irrelevant for most users.
                if (!fs.existsSync(file1) && convEnc) {
                    const f = (0, convertfilename_1.convertFilenameEncoding)(file1);
                    if (f !== undefined) {
                        file1 = f;
                    }
                }
                this.linterDiagnostics.set(vscode.Uri.file(file1), diagsCollection[file]);
            }
        }
    }
}
exports.LinterLogParser = LinterLogParser;
//# sourceMappingURL=linterlog.js.map