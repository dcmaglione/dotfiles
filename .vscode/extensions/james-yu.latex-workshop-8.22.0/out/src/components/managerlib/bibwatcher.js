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
exports.BibWatcher = void 0;
const vscode = __importStar(require("vscode"));
const chokidar = __importStar(require("chokidar"));
class BibWatcher {
    constructor(extension) {
        this.bibsWatched = new Set();
        this.extension = extension;
        this.bibWatcher = this.initiateBibwatcher();
    }
    initiateBibwatcher() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const usePolling = configuration.get('latex.watch.usePolling');
        const interval = configuration.get('latex.watch.interval');
        const delay = configuration.get('latex.watch.delay');
        const watcherOptions = {
            useFsEvents: false,
            usePolling,
            interval,
            binaryInterval: Math.max(interval, 1000),
            awaitWriteFinish: { stabilityThreshold: delay }
        };
        this.extension.logger.addLogMessage('Creating Bib file watcher.');
        this.extension.logger.addLogMessage(`watcherOptions: ${JSON.stringify(watcherOptions)}`);
        const bibWatcher = chokidar.watch([], watcherOptions);
        bibWatcher.on('change', (file) => this.onWatchedBibChanged(file));
        bibWatcher.on('unlink', (file) => this.onWatchedBibDeleted(file));
        return bibWatcher;
    }
    async onWatchedBibChanged(file) {
        this.extension.logger.addLogMessage(`Bib file watcher - file changed: ${file}`);
        await this.extension.completer.citation.parseBibFile(file);
        await this.extension.manager.buildOnFileChanged(file, true);
    }
    onWatchedBibDeleted(file) {
        this.extension.logger.addLogMessage(`Bib file watcher - file deleted: ${file}`);
        this.bibWatcher.unwatch(file);
        this.bibsWatched.delete(file);
        this.extension.completer.citation.removeEntriesInFile(file);
    }
    async watchBibFile(bibPath) {
        if (!this.bibsWatched.has(bibPath)) {
            this.extension.logger.addLogMessage(`Added to bib file watcher: ${bibPath}`);
            this.bibWatcher.add(bibPath);
            this.bibsWatched.add(bibPath);
            await this.extension.completer.citation.parseBibFile(bibPath);
        }
    }
    logWatchedFiles() {
        this.extension.logger.addLogMessage(`BibWatcher.bibWatcher.getWatched: ${JSON.stringify(this.bibWatcher.getWatched())}`);
        this.extension.logger.addLogMessage(`BibWatcher.bibsWatched: ${JSON.stringify(Array.from(this.bibsWatched))}`);
    }
}
exports.BibWatcher = BibWatcher;
//# sourceMappingURL=bibwatcher.js.map