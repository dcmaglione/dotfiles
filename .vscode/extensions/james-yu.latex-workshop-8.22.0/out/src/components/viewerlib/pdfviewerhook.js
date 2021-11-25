"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfViewerHookProvider = void 0;
class PdfViewerHookProvider {
    constructor(extension) {
        this.extension = extension;
    }
    openCustomDocument(uri) {
        this.extension.manager.watchPdfFile(uri.fsPath);
        return {
            uri,
            dispose: () => { }
        };
    }
    resolveCustomEditor(document, webviewPanel) {
        webviewPanel.webview.html = 'LaTeX Workshop PDF Viewer is opening a PDF file...';
        setTimeout(() => {
            webviewPanel.dispose();
            void this.extension.commander.pdf(document.uri);
        }, 1000);
    }
}
exports.PdfViewerHookProvider = PdfViewerHookProvider;
//# sourceMappingURL=pdfviewerhook.js.map