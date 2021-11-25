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
exports.Environment = exports.EnvSnippetType = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const latex_utensils_1 = require("latex-utensils");
const commandfinder_1 = require("./commandlib/commandfinder");
function isEnvItemEntry(obj) {
    return (typeof obj.name === 'string');
}
var EnvSnippetType;
(function (EnvSnippetType) {
    EnvSnippetType[EnvSnippetType["AsName"] = 0] = "AsName";
    EnvSnippetType[EnvSnippetType["AsCommand"] = 1] = "AsCommand";
    EnvSnippetType[EnvSnippetType["ForBegin"] = 2] = "ForBegin";
})(EnvSnippetType = exports.EnvSnippetType || (exports.EnvSnippetType = {}));
class Environment {
    constructor(extension) {
        this.defaultEnvsAsName = [];
        this.defaultEnvsAsCommand = [];
        this.defaultEnvsForBegin = [];
        this.packageEnvsAsName = new Map();
        this.packageEnvsAsCommand = new Map();
        this.packageEnvsForBegin = new Map();
        this.extension = extension;
    }
    initialize(envs) {
        this.defaultEnvsAsCommand = [];
        this.defaultEnvsForBegin = [];
        this.defaultEnvsAsName = [];
        Object.keys(envs).forEach(key => {
            this.defaultEnvsAsCommand.push(this.entryEnvToCompletion(key, envs[key], EnvSnippetType.AsCommand));
            this.defaultEnvsForBegin.push(this.entryEnvToCompletion(key, envs[key], EnvSnippetType.ForBegin));
            this.defaultEnvsAsName.push(this.entryEnvToCompletion(key, envs[key], EnvSnippetType.AsName));
        });
    }
    getDefaultEnvs(type) {
        switch (type) {
            case EnvSnippetType.AsName:
                return this.defaultEnvsAsName;
                break;
            case EnvSnippetType.AsCommand:
                return this.defaultEnvsAsCommand;
                break;
            case EnvSnippetType.ForBegin:
                return this.defaultEnvsForBegin;
                break;
            default:
                return [];
        }
    }
    getPackageEnvs(type) {
        switch (type) {
            case EnvSnippetType.AsName:
                return this.packageEnvsAsName;
                break;
            case EnvSnippetType.AsCommand:
                return this.packageEnvsAsCommand;
                break;
            case EnvSnippetType.ForBegin:
                return this.packageEnvsForBegin;
                break;
            default:
                return new Map();
        }
    }
    provideFrom(_result, args) {
        const payload = { document: args.document, position: args.position };
        return this.provide(payload);
    }
    provide(args) {
        if (vscode.window.activeTextEditor === undefined) {
            return [];
        }
        let snippetType = EnvSnippetType.ForBegin;
        if (vscode.window.activeTextEditor.selections.length > 1 || args.document.lineAt(args.position.line).text.slice(args.position.character).match(/[a-zA-Z*]*}/)) {
            snippetType = EnvSnippetType.AsName;
        }
        // Extract cached envs and add to default ones
        const suggestions = Array.from(this.getDefaultEnvs(snippetType));
        const envList = this.getDefaultEnvs(snippetType).map(env => env.label);
        // Insert package environments
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('intellisense.package.enabled')) {
            const extraPackages = this.extension.completer.command.getExtraPkgs(args.document.languageId);
            if (extraPackages) {
                extraPackages.forEach(pkg => {
                    this.getEnvFromPkg(pkg, snippetType).forEach(env => {
                        if (!envList.includes(env.label)) {
                            suggestions.push(env);
                            envList.push(env.label);
                        }
                    });
                });
            }
            this.extension.manager.getIncludedTeX().forEach(tex => {
                var _a;
                const pkgs = (_a = this.extension.manager.getCachedContent(tex)) === null || _a === void 0 ? void 0 : _a.element.package;
                if (pkgs !== undefined) {
                    pkgs.forEach(pkg => {
                        this.getEnvFromPkg(pkg, snippetType).forEach(env => {
                            if (!envList.includes(env.label)) {
                                suggestions.push(env);
                                envList.push(env.label);
                            }
                        });
                    });
                }
            });
        }
        // Insert environments defined in tex
        this.extension.manager.getIncludedTeX().forEach(cachedFile => {
            var _a;
            const cachedEnvs = (_a = this.extension.manager.getCachedContent(cachedFile)) === null || _a === void 0 ? void 0 : _a.element.environment;
            if (cachedEnvs !== undefined) {
                cachedEnvs.forEach(env => {
                    if (!envList.includes(env.label)) {
                        if (snippetType === EnvSnippetType.ForBegin) {
                            env.insertText = new vscode.SnippetString(`${env.label}}\n\t$0\n\\end{${env.label}}`);
                        }
                        else {
                            env.insertText = env.label;
                        }
                        suggestions.push(env);
                        envList.push(env.label);
                    }
                });
            }
        });
        return suggestions;
    }
    provideEnvsAsCommandInPkg(pkg, suggestions, cmdList) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const useOptionalArgsEntries = configuration.get('intellisense.optionalArgsEntries.enabled');
        if (!configuration.get('intellisense.package.env.enabled')) {
            return;
        }
        // Load environments from the package if not already done
        if (!this.packageEnvsAsCommand.has(pkg)) {
            const entry = [];
            const envs = this.getEnvItemsFromPkg(pkg);
            Object.keys(envs).forEach(key => {
                entry.push(this.entryEnvToCompletion(key, envs[key], EnvSnippetType.AsCommand));
            });
            this.packageEnvsAsCommand.set(pkg, entry);
        }
        // No environment defined in package
        const entry = this.packageEnvsAsCommand.get(pkg);
        if (!entry || entry.length === 0) {
            return;
        }
        // Insert env snippets
        entry.forEach(env => {
            const envName = env.filterText ? env.filterText : env.label;
            if (!useOptionalArgsEntries && envName.includes('[')) {
                return;
            }
            if (!cmdList.includes(envName)) {
                suggestions.push(env);
                cmdList.push(envName);
            }
        });
    }
    /**
     * Updates the Manager cache for environments used in `file` with `nodes`.
     * If `nodes` is `undefined`, `content` is parsed with regular expressions,
     * and the result is used to update the cache.
     * @param file The path of a LaTeX file.
     * @param nodes AST of a LaTeX file.
     * @param content The content of a LaTeX file.
     */
    update(file, nodes, lines, content) {
        const cache = this.extension.manager.getCachedContent(file);
        if (cache === undefined) {
            return;
        }
        if (nodes !== undefined && lines !== undefined) {
            cache.element.environment = this.getEnvFromNodeArray(nodes, lines);
        }
        else if (content !== undefined) {
            cache.element.environment = this.getEnvFromContent(content);
        }
    }
    // This function will return all environments in a node array, including sub-nodes
    getEnvFromNodeArray(nodes, lines) {
        let envs = [];
        for (let index = 0; index < nodes.length; ++index) {
            envs = envs.concat(this.getEnvFromNode(nodes[index], lines));
        }
        return envs;
    }
    getEnvFromNode(node, lines) {
        let envs = [];
        // Here we only check `isEnvironment`which excludes `align*` and `verbatim`.
        // Nonetheless, they have already been included in `defaultEnvs`.
        if (latex_utensils_1.latexParser.isEnvironment(node)) {
            const env = {
                label: `${node.name}`,
                kind: vscode.CompletionItemKind.Module,
                documentation: '`' + node.name + '`',
                filterText: node.name,
                package: ''
            };
            envs.push(env);
        }
        if (latex_utensils_1.latexParser.hasContentArray(node)) {
            envs = envs.concat(this.getEnvFromNodeArray(node.content, lines));
        }
        return envs;
    }
    getEnvItemsFromPkg(pkg) {
        const filePath = (0, commandfinder_1.resolveCmdEnvFile)(`${pkg}_env.json`, `${this.extension.extensionRoot}/data/packages/`);
        if (filePath === undefined) {
            return {};
        }
        try {
            const envs = JSON.parse(fs.readFileSync(filePath).toString());
            Object.keys(envs).forEach(key => {
                if (!isEnvItemEntry(envs[key])) {
                    this.extension.logger.addLogMessage(`Cannot parse intellisense file: ${filePath}`);
                    this.extension.logger.addLogMessage(`Missing field in entry: "${key}": ${JSON.stringify(envs[key])}`);
                    delete envs[key];
                }
            });
            return envs;
        }
        catch (e) {
            this.extension.logger.addLogMessage(`Cannot parse intellisense file: ${filePath}`);
        }
        return {};
    }
    getEnvFromPkg(pkg, type) {
        const packageEnvs = this.getPackageEnvs(type);
        const entry = packageEnvs.get(pkg);
        if (entry !== undefined) {
            return entry;
        }
        const newEntry = [];
        const envs = this.getEnvItemsFromPkg(pkg);
        Object.keys(envs).forEach(key => {
            newEntry.push(this.entryEnvToCompletion(key, envs[key], type));
        });
        packageEnvs.set(pkg, newEntry);
        return newEntry;
    }
    getEnvFromContent(content) {
        const envReg = /\\begin\s?{([^{}]*)}/g;
        const envs = [];
        const envList = [];
        while (true) {
            const result = envReg.exec(content);
            if (result === null) {
                break;
            }
            if (envList.includes(result[1])) {
                continue;
            }
            const env = {
                label: `${result[1]}`,
                kind: vscode.CompletionItemKind.Module,
                documentation: '`' + result[1] + '`',
                filterText: result[1],
                package: ''
            };
            envs.push(env);
            envList.push(result[1]);
        }
        return envs;
    }
    entryEnvToCompletion(itemKey, item, type) {
        const label = item.detail ? item.detail : item.name;
        const suggestion = {
            label: item.name,
            kind: vscode.CompletionItemKind.Module,
            package: 'latex',
            detail: `Insert environment ${item.name}.`,
            documentation: item.name
        };
        if (item.package) {
            suggestion.documentation += '\n' + `Package: ${item.package}`;
        }
        suggestion.sortText = label.replace(/^[a-zA-Z]/, c => {
            const n = c.match(/[a-z]/) ? c.toUpperCase().charCodeAt(0) : c.toLowerCase().charCodeAt(0);
            return n !== undefined ? n.toString(16) : c;
        });
        if (type === EnvSnippetType.AsName) {
            return suggestion;
        }
        else {
            if (type === EnvSnippetType.AsCommand) {
                suggestion.kind = vscode.CompletionItemKind.Snippet;
            }
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            const useTabStops = configuration.get('intellisense.useTabStops.enabled');
            const prefix = (type === EnvSnippetType.ForBegin) ? '' : 'begin{';
            let snippet = item.snippet ? item.snippet : '';
            if (item.snippet) {
                if (useTabStops) {
                    snippet = item.snippet.replace(/\$\{(\d+):[^}]*\}/g, '$${$1}');
                }
            }
            if (snippet.match(/\$\{?0\}?/)) {
                snippet = snippet.replace(/\$\{?0\}?/, '$${0:$${TM_SELECTED_TEXT}}');
                snippet += '\n';
            }
            else {
                snippet += '\n\t${0:${TM_SELECTED_TEXT}}\n';
            }
            if (item.detail) {
                suggestion.label = item.detail;
            }
            suggestion.filterText = itemKey;
            suggestion.insertText = new vscode.SnippetString(`${prefix}${item.name}}${snippet}\\end{${item.name}}`);
            return suggestion;
        }
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map