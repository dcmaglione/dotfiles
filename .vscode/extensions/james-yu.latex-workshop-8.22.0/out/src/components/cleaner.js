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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cleaner = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const glob_1 = __importDefault(require("glob"));
const cs = __importStar(require("cross-spawn"));
class Cleaner {
    constructor(extension) {
        this.extension = extension;
    }
    async clean(rootFile) {
        if (!rootFile) {
            if (this.extension.manager.rootFile !== undefined) {
                await this.extension.manager.findRoot();
            }
            rootFile = this.extension.manager.rootFile;
            if (!rootFile) {
                this.extension.logger.addLogMessage('Cannot determine the root file to be cleaned.');
                return;
            }
        }
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const cleanMethod = configuration.get('latex.clean.method');
        switch (cleanMethod) {
            case 'glob':
                return this.cleanGlob(rootFile);
            case 'cleanCommand':
                return this.cleanCommand(rootFile);
            default:
                this.extension.logger.addLogMessage(`Unknown cleaning method: ${cleanMethod}`);
                return;
        }
    }
    async cleanGlob(rootFile) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        let globs = configuration.get('latex.clean.fileTypes');
        const outdir = path.resolve(path.dirname(rootFile), this.extension.manager.getOutDir(rootFile));
        if (configuration.get('latex.clean.subfolder.enabled')) {
            globs = globs.map(globType => './**/' + globType);
        }
        this.extension.logger.addLogMessage(`Clean glob matched files: ${JSON.stringify({ globs, outdir })}`);
        const files = globs.map(g => glob_1.default.sync(g, { cwd: outdir }))
            // Reduce the array of arrays to a single array containing all the files that should be deleted
            .reduce((all, curr) => all.concat(curr), [])
            // Resolve the absolute filepath for every file
            .map(file => path.resolve(outdir, file));
        for (const file of files) {
            try {
                const stats = fs.statSync(file);
                if (stats.isFile()) {
                    await fs.promises.unlink(file);
                    this.extension.logger.addLogMessage(`Cleaning file: ${file}`);
                }
                else {
                    this.extension.logger.addLogMessage(`Not removing non-file: ${file}`);
                }
            }
            catch (err) {
                this.extension.logger.addLogMessage(`Error cleaning file: ${file}`);
                if (err instanceof Error) {
                    this.extension.logger.logError(err);
                }
            }
        }
    }
    cleanCommand(rootFile) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const command = configuration.get('latex.clean.command');
        let args = configuration.get('latex.clean.args');
        if (args) {
            args = args.map(arg => arg.replace('%TEX%', rootFile));
        }
        this.extension.logger.addLogMessage(`Clean temporary files using: ${JSON.stringify({ command, args })}`);
        return new Promise((resolve, _reject) => {
            const proc = cs.spawn(command, args, { cwd: path.dirname(rootFile), detached: true });
            let stderr = '';
            proc.stderr.on('data', newStderr => {
                stderr += newStderr;
            });
            proc.on('error', err => {
                this.extension.logger.addLogMessage(`Cannot run ${command}: ${err.message}, ${stderr}`);
                if (err instanceof Error) {
                    this.extension.logger.logError(err);
                }
                resolve();
            });
            proc.on('exit', exitCode => {
                if (exitCode !== 0) {
                    this.extension.logger.addLogMessage(`The clean command failed with exit code ${exitCode}`);
                    this.extension.logger.addLogMessage(`Clean command stderr: ${stderr}`);
                }
                resolve();
            });
        });
    }
}
exports.Cleaner = Cleaner;
//# sourceMappingURL=cleaner.js.map