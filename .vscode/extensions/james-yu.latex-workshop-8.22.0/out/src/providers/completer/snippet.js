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
exports.Snippet = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const utils_1 = require("../../utils/utils");
class Snippet {
    constructor(extension, triggerCharacter) {
        this.suggestions = [];
        this.extension = extension;
        this.triggerCharacter = triggerCharacter;
        this.escapedTriggerCharacter = (0, utils_1.escapeRegExp)(this.triggerCharacter);
        const allSnippets = JSON.parse(fs.readFileSync(`${this.extension.extensionRoot}/data/snippets-as-commands.json`).toString());
        this.initialize(allSnippets);
    }
    initialize(snippets) {
        Object.keys(snippets).forEach(key => {
            const item = snippets[key];
            const completionItem = new vscode.CompletionItem(item.prefix.replace('@', this.triggerCharacter), vscode.CompletionItemKind.Function);
            completionItem.insertText = new vscode.SnippetString(item.body);
            completionItem.documentation = new vscode.MarkdownString(item.description);
            this.suggestions.push(completionItem);
        });
    }
    provideFrom(result, args) {
        const suggestions = this.provide(args.document, args.position);
        // Manually filter suggestions when there are several consecutive trigger characters
        const reg = new RegExp(this.escapedTriggerCharacter + '{2,}$');
        if (result[0].match(reg)) {
            const filteredSuggestions = suggestions.filter(item => item.label === result[0]);
            if (filteredSuggestions.length > 0) {
                return filteredSuggestions.map(item => {
                    item.range = new vscode.Range(args.position.translate(undefined, -item.label.toString().length), args.position);
                    return item;
                });
            }
        }
        return suggestions;
    }
    provide(document, position) {
        let range = undefined;
        const startPos = document.lineAt(position).text.lastIndexOf(this.triggerCharacter, position.character - 1);
        if (startPos >= 0) {
            range = new vscode.Range(position.line, startPos, position.line, position.character);
        }
        this.suggestions.forEach(snippet => { snippet.range = range; });
        return this.suggestions;
    }
}
exports.Snippet = Snippet;
//# sourceMappingURL=snippet.js.map