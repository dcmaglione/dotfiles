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
exports.SnippetView = void 0;
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
const path = __importStar(require("path"));
const webview_1 = require("../utils/webview");
class SnippetView {
    constructor(extension) {
        this.extension = extension;
        this.snippetViewProvider = new SnippetViewProvider(extension);
    }
    async renderPdf(pdfFileUri, opts) {
        var _a;
        const webview = (_a = this.snippetViewProvider.webviewView) === null || _a === void 0 ? void 0 : _a.webview;
        if (!webview) {
            return;
        }
        const uri = webview.asWebviewUri(pdfFileUri).toString();
        let disposable;
        const promise = new Promise((resolve) => {
            disposable = this.snippetViewProvider.onDidReceiveMessage((e) => {
                if (e.type !== 'png') {
                    return;
                }
                if (e.uri === uri) {
                    resolve(e);
                }
            });
            setTimeout(() => {
                disposable === null || disposable === void 0 ? void 0 : disposable.dispose();
                resolve(undefined);
            }, 3000);
            void webview.postMessage({
                type: 'pdf',
                uri,
                opts
            });
        });
        try {
            const renderResult = await promise;
            return renderResult === null || renderResult === void 0 ? void 0 : renderResult.data;
        }
        finally {
            disposable === null || disposable === void 0 ? void 0 : disposable.dispose();
        }
    }
}
exports.SnippetView = SnippetView;
class SnippetViewProvider {
    constructor(extension) {
        this.cbSet = new Set();
        this.extension = extension;
        const editor = vscode.window.activeTextEditor;
        if (editor && this.extension.manager.hasTexId(editor.document.languageId)) {
            this.lastActiveTextEditor = editor;
        }
        vscode.window.onDidChangeActiveTextEditor(textEditor => {
            if (textEditor && this.extension.manager.hasTexId(textEditor.document.languageId)) {
                this.lastActiveTextEditor = textEditor;
            }
        });
    }
    get webviewView() {
        return this.view;
    }
    resolveWebviewView(webviewView) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true
        };
        webviewView.onDidDispose(() => {
            this.view = undefined;
        });
        const webviewSourcePath = path.join(this.extension.extensionRoot, 'resources', 'snippetview', 'snippetview.html');
        let webviewHtml = (0, fs_1.readFileSync)(webviewSourcePath, { encoding: 'utf8' });
        webviewHtml = (0, webview_1.replaceWebviewPlaceholders)(webviewHtml, this.extension, this.view.webview);
        webviewView.webview.html = webviewHtml;
        webviewView.webview.onDidReceiveMessage((e) => {
            this.cbSet.forEach((cb) => void cb(e));
            this.messageReceive(e);
        });
    }
    messageReceive(message) {
        if (message.type === 'insertSnippet') {
            const editor = this.lastActiveTextEditor;
            if (editor) {
                editor.insertSnippet(new vscode.SnippetString(message.snippet.replace(/\\\n/g, '\\n'))).then(() => { }, err => {
                    void vscode.window.showWarningMessage(`Unable to insert symbol, ${err}`);
                });
            }
            else {
                void vscode.window.showWarningMessage('Unable get document to insert symbol into');
            }
        }
    }
    onDidReceiveMessage(cb) {
        this.cbSet.add(cb);
        return {
            dispose: () => this.cbSet.delete(cb)
        };
    }
}
//# sourceMappingURL=snippetview.js.map