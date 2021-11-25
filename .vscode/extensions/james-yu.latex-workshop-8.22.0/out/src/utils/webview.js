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
exports.openWebviewPanel = exports.replaceWebviewPlaceholders = void 0;
const vscode = __importStar(require("vscode"));
function replaceWebviewPlaceholders(content, extension, webview) {
    const extensionRootUri = vscode.Uri.file(extension.extensionRoot);
    const resourcesFolderUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionRootUri, 'resources'));
    const resourcesFolderLink = resourcesFolderUri.toString();
    const pdfjsDistUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionRootUri, 'node_modules', 'pdfjs-dist'));
    const pdfjsDistLink = pdfjsDistUri.toString();
    return content.replace(/%VSCODE_RES%/g, resourcesFolderLink)
        .replace(/%VSCODE_PDFJS_DIST%/g, pdfjsDistLink)
        .replace(/%VSCODE_CSP%/g, webview.cspSource);
}
exports.replaceWebviewPlaceholders = replaceWebviewPlaceholders;
/**
 *
 * @param panel
 * @param tabEditorGroup
 * @param activeDocument The document we set the focus back to. We should get the document before calling createWebviewPanel.
 * @param preserveFocus
 */
async function openWebviewPanel(panel, tabEditorGroup, activeDocument, preserveFocus = true) {
    // We need to turn the viewer into the active editor to move it to an other editor group
    panel.reveal(undefined, false);
    let focusAction;
    switch (tabEditorGroup) {
        case 'left': {
            await vscode.commands.executeCommand('workbench.action.moveEditorToLeftGroup');
            focusAction = 'workbench.action.focusRightGroup';
            break;
        }
        case 'right': {
            await vscode.commands.executeCommand('workbench.action.moveEditorToRightGroup');
            focusAction = 'workbench.action.focusLeftGroup';
            break;
        }
        case 'above': {
            await vscode.commands.executeCommand('workbench.action.moveEditorToAboveGroup');
            focusAction = 'workbench.action.focusBelowGroup';
            break;
        }
        case 'below': {
            await vscode.commands.executeCommand('workbench.action.moveEditorToBelowGroup');
            focusAction = 'workbench.action.focusAboveGroup';
            break;
        }
        default: {
            break;
        }
    }
    // Then, we set the focus back to the .tex file
    const configuration = vscode.workspace.getConfiguration('latex-workshop');
    const delay = configuration.get('view.pdf.tab.openDelay', 1000);
    setTimeout(async () => {
        if (!preserveFocus) {
            return;
        }
        if (focusAction) {
            await vscode.commands.executeCommand(focusAction);
        }
        await vscode.window.showTextDocument(activeDocument, vscode.ViewColumn.Active);
    }, delay);
}
exports.openWebviewPanel = openWebviewPanel;
//# sourceMappingURL=webview.js.map