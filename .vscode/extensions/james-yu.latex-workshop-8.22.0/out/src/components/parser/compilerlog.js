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
exports.CompilerLogParser = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const convertfilename_1 = require("../../utils/convertfilename");
const latexlog_1 = require("./latexlog");
const biblogparser_1 = require("./biblogparser");
// Notice that 'Output written on filename.pdf' isn't output in draft mode.
// https://github.com/James-Yu/LaTeX-Workshop/issues/2893#issuecomment-936312853
const latexPattern = /^Output\swritten\son\s(.*)\s\(.*\)\.$/gm;
const latexFatalPattern = /Fatal error occurred, no output PDF file produced!/gm;
const latexmkPattern = /^Latexmk:\sapplying\srule/gm;
const latexmkLog = /^Latexmk:\sapplying\srule/;
const latexmkLogLatex = /^Latexmk:\sapplying\srule\s'(pdf|lua|xe)?latex'/;
const latexmkUpToDate = /^Latexmk: All targets \(.*\) are up-to-date/m;
const texifyPattern = /^running\s(pdf|lua|xe)?latex/gm;
const texifyLog = /^running\s((pdf|lua|xe)?latex|miktex-bibtex)/;
const texifyLogLatex = /^running\s(pdf|lua|xe)?latex/;
const bibtexPattern = /^This is BibTeX, Version.*$/m;
const DIAGNOSTIC_SEVERITY = {
    'typesetting': vscode.DiagnosticSeverity.Information,
    'warning': vscode.DiagnosticSeverity.Warning,
    'error': vscode.DiagnosticSeverity.Error,
};
class CompilerLogParser {
    constructor(extension) {
        this.isLaTeXmkSkipped = false;
        this.latexLogParser = new latexlog_1.LatexLogParser(extension);
        this.bibLogParser = new biblogparser_1.BibLogParser(extension);
    }
    parse(log, rootFile) {
        this.isLaTeXmkSkipped = false;
        // Canonicalize line-endings
        log = log.replace(/(\r\n)|\r/g, '\n');
        if (log.match(bibtexPattern)) {
            if (log.match(latexmkPattern)) {
                this.bibLogParser.parse(this.trimLaTeXmkBibTeX(log), rootFile);
            }
            else {
                this.bibLogParser.parse(log, rootFile);
            }
        }
        if (log.match(latexmkPattern)) {
            log = this.trimLaTeXmk(log);
        }
        else if (log.match(texifyPattern)) {
            log = this.trimTexify(log);
        }
        if (log.match(latexPattern) || log.match(latexFatalPattern)) {
            this.latexLogParser.parse(log, rootFile);
        }
        else if (this.latexmkSkipped(log)) {
            this.isLaTeXmkSkipped = true;
        }
    }
    trimLaTeXmk(log) {
        return this.trimPattern(log, latexmkLogLatex, latexmkLog);
    }
    trimLaTeXmkBibTeX(log) {
        return this.trimPattern(log, bibtexPattern, latexmkLogLatex);
    }
    trimTexify(log) {
        return this.trimPattern(log, texifyLogLatex, texifyLog);
    }
    /**
     * Return the lines between the last occurrences of `beginPattern` and `endPattern`.
     * If `endPattern` is not found, the lines from the last occurrence of
     * `beginPattern` up to the end is returned.
     */
    trimPattern(log, beginPattern, endPattern) {
        const lines = log.split('\n');
        let startLine = -1;
        let finalLine = -1;
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            let result = line.match(beginPattern);
            if (result) {
                startLine = index;
            }
            result = line.match(endPattern);
            if (result) {
                finalLine = index;
            }
        }
        if (finalLine <= startLine) {
            return lines.slice(startLine).join('\n');
        }
        else {
            return lines.slice(startLine, finalLine).join('\n');
        }
    }
    latexmkSkipped(log) {
        if (log.match(latexmkUpToDate) && !log.match(latexmkPattern)) {
            this.showCompilerDiagnostics(this.latexLogParser.compilerDiagnostics, this.latexLogParser.buildLog, 'LaTeX');
            this.showCompilerDiagnostics(this.bibLogParser.compilerDiagnostics, this.bibLogParser.buildLog, 'BibTeX');
            return true;
        }
        return false;
    }
    showCompilerDiagnostics(compilerDiagnostics, buildLog, source) {
        compilerDiagnostics.clear();
        const diagsCollection = Object.create(null);
        for (const item of buildLog) {
            const range = new vscode.Range(new vscode.Position(item.line - 1, 0), new vscode.Position(item.line - 1, 65535));
            const diag = new vscode.Diagnostic(range, item.text, DIAGNOSTIC_SEVERITY[item.type]);
            diag.source = source;
            if (diagsCollection[item.file] === undefined) {
                diagsCollection[item.file] = [];
            }
            diagsCollection[item.file].push(diag);
        }
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const convEnc = configuration.get('message.convertFilenameEncoding');
        for (const file in diagsCollection) {
            let file1 = file;
            if (!fs.existsSync(file1) && convEnc) {
                const f = (0, convertfilename_1.convertFilenameEncoding)(file1);
                if (f !== undefined) {
                    file1 = f;
                }
            }
            compilerDiagnostics.set(vscode.Uri.file(file1), diagsCollection[file]);
        }
    }
}
exports.CompilerLogParser = CompilerLogParser;
//# sourceMappingURL=compilerlog.js.map