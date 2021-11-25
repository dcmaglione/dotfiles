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
exports.Linter = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const os_1 = require("os");
class Linter {
    constructor(extension) {
        this.currentProcesses = Object.create(null);
        this.extension = extension;
    }
    get rcPath() {
        var _a;
        let rcPath;
        // 0. root file folder
        const root = this.extension.manager.rootFile;
        if (root) {
            rcPath = path.resolve(path.dirname(root), './.chktexrc');
        }
        else {
            return;
        }
        if (fs.existsSync(rcPath)) {
            return rcPath;
        }
        // 1. project root folder
        const workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
        if (workspaceFolder) {
            rcPath = path.resolve(workspaceFolder.uri.fsPath, './.chktexrc');
        }
        if (fs.existsSync(rcPath)) {
            return rcPath;
        }
        return undefined;
    }
    globalRcPath() {
        const rcPathArray = [];
        if (os.platform() === 'win32') {
            if (process.env.CHKTEXRC) {
                rcPathArray.push(path.join(process.env.CHKTEXRC, 'chktexrc'));
            }
            if (process.env.CHKTEX_HOME) {
                rcPathArray.push(path.join(process.env.CHKTEX_HOME, 'chktexrc'));
            }
            if (process.env.EMTEXDIR) {
                rcPathArray.push(path.join(process.env.EMTEXDIR, 'data', 'chktexrc'));
            }
        }
        else {
            if (process.env.HOME) {
                rcPathArray.push(path.join(process.env.HOME, '.chktexrc'));
            }
            if (process.env.LOGDIR) {
                rcPathArray.push(path.join(process.env.LOGDIR, '.chktexrc'));
            }
            if (process.env.CHKTEXRC) {
                rcPathArray.push(path.join(process.env.CHKTEXRC, '.chktexrc'));
            }
        }
        for (const rcPath of rcPathArray) {
            if (fs.existsSync(rcPath)) {
                return rcPath;
            }
        }
        return;
    }
    lintRootFileIfEnabled() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('chktex.enabled')) {
            void this.lintRootFile();
        }
    }
    lintActiveFileIfEnabledAfterInterval() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('chktex.enabled') &&
            configuration.get('chktex.run') === 'onType') {
            const interval = configuration.get('chktex.delay');
            if (this.linterTimeout) {
                clearTimeout(this.linterTimeout);
            }
            this.linterTimeout = setTimeout(() => this.lintActiveFile(), interval);
        }
    }
    async lintActiveFile() {
        if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document.getText()) {
            return;
        }
        this.extension.logger.addLogMessage('Linter for active file started.');
        const filePath = vscode.window.activeTextEditor.document.fileName;
        const content = vscode.window.activeTextEditor.document.getText();
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const command = configuration.get('chktex.path');
        const args = [...configuration.get('chktex.args.active')];
        if (!args.includes('-l')) {
            const rcPath = this.rcPath;
            if (rcPath) {
                args.push('-l', rcPath);
            }
        }
        const requiredArgs = ['-I0', '-f%f:%l:%c:%d:%k:%n:%m\n'];
        let stdout;
        try {
            stdout = await this.processWrapper('active file', command, args.concat(requiredArgs).filter(arg => arg !== ''), { cwd: path.dirname(filePath) }, content);
        }
        catch (err) {
            if ('stdout' in err) {
                stdout = err.stdout;
            }
            else {
                return;
            }
        }
        // provide the original path to the active file as the second argument, so
        // we report this second path in the diagnostics instead of the temporary one.
        const tabSize = this.getChktexrcTabSize();
        this.extension.linterLogParser.parse(stdout, filePath, tabSize);
    }
    async lintRootFile() {
        this.extension.logger.addLogMessage('Linter for root file started.');
        if (this.extension.manager.rootFile === undefined) {
            this.extension.logger.addLogMessage('No root file found for linting.');
            return;
        }
        const filePath = this.extension.manager.rootFile;
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const command = configuration.get('chktex.path');
        const args = [...configuration.get('chktex.args.active')];
        if (!args.includes('-l')) {
            const rcPath = this.rcPath;
            if (rcPath) {
                args.push('-l', rcPath);
            }
        }
        const requiredArgs = ['-f%f:%l:%c:%d:%k:%n:%m\n', filePath];
        let stdout;
        try {
            stdout = await this.processWrapper('root file', command, args.concat(requiredArgs).filter(arg => arg !== ''), { cwd: path.dirname(this.extension.manager.rootFile) });
        }
        catch (err) {
            if ('stdout' in err) {
                stdout = err.stdout;
            }
            else {
                return;
            }
        }
        const tabSize = this.getChktexrcTabSize();
        this.extension.linterLogParser.parse(stdout, undefined, tabSize);
    }
    getChktexrcTabSize() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const args = configuration.get('chktex.args.active');
        let filePath;
        if (args.includes('-l')) {
            const idx = args.indexOf('-l');
            if (idx >= 0) {
                const rcpath = args[idx + 1];
                if (fs.existsSync(rcpath)) {
                    filePath = rcpath;
                }
            }
        }
        else {
            if (this.rcPath) {
                filePath = this.rcPath;
            }
            else {
                filePath = this.globalRcPath();
            }
        }
        if (!filePath) {
            this.extension.logger.addLogMessage('The .chktexrc file not found.');
            return;
        }
        const rcFile = fs.readFileSync(filePath).toString();
        const reg = /^\s*TabSize\s*=\s*(\d+)\s*$/m;
        const match = reg.exec(rcFile);
        if (match) {
            const ret = Number(match[1]);
            this.extension.logger.addLogMessage(`TabSize and .chktexrc: ${ret}, ${filePath}`);
            return ret;
        }
        this.extension.logger.addLogMessage(`TabSize not found in the .chktexrc file: ${filePath}`);
        return;
    }
    processWrapper(linterId, command, args, options, stdin) {
        this.extension.logger.addLogMessage(`Linter for ${linterId} running command ${command} with arguments ${JSON.stringify(args)}`);
        return new Promise((resolve, reject) => {
            if (this.currentProcesses[linterId]) {
                this.currentProcesses[linterId].kill();
            }
            const startTime = process.hrtime();
            this.currentProcesses[linterId] = (0, child_process_1.spawn)(command, args, options);
            const proc = this.currentProcesses[linterId];
            proc.stdout.setEncoding('binary');
            proc.stderr.setEncoding('binary');
            let stdout = '';
            proc.stdout.on('data', newStdout => {
                stdout += newStdout;
            });
            let stderr = '';
            proc.stderr.on('data', newStderr => {
                stderr += newStderr;
            });
            proc.on('error', err => {
                this.extension.logger.addLogMessage(`Linter for ${linterId} failed to spawn command, encountering error: ${err.message}`);
                return reject(err);
            });
            proc.on('exit', exitCode => {
                if (exitCode !== 0) {
                    let msg;
                    if (stderr === '') {
                        msg = stderr;
                    }
                    else {
                        msg = '\n' + stderr;
                    }
                    this.extension.logger.addLogMessage(`Linter for ${linterId} failed with exit code ${exitCode} and error:${msg}`);
                    return reject({ exitCode, stdout, stderr });
                }
                else {
                    const [s, ms] = process.hrtime(startTime);
                    this.extension.logger.addLogMessage(`Linter for ${linterId} successfully finished in ${s}s ${Math.round(ms / 1000000)}ms`);
                    return resolve(stdout);
                }
            });
            if (stdin !== undefined) {
                proc.stdin.write(stdin);
                if (!stdin.endsWith(os_1.EOL)) {
                    // Always ensure we end with EOL otherwise ChkTeX will report line numbers as off by 1.
                    proc.stdin.write(os_1.EOL);
                }
                proc.stdin.end();
            }
        });
    }
}
exports.Linter = Linter;
//# sourceMappingURL=linter.js.map