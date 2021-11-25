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
exports.CommandFinder = exports.resolveCmdEnvFile = exports.isTriggerSuggestNeeded = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const latex_utensils_1 = require("latex-utensils");
function isTriggerSuggestNeeded(name) {
    const reg = /[a-z]*(cite|ref|input)[a-z]*|begin|bibitem|(sub)?(import|includefrom|inputfrom)|gls(?:pl|text|first|plural|firstplural|name|symbol|desc|user(?:i|ii|iii|iv|v|vi))?|Acr(?:long|full|short)?(?:pl)?|ac[slf]?p?/i;
    return reg.test(name);
}
exports.isTriggerSuggestNeeded = isTriggerSuggestNeeded;
function resolveCmdEnvFile(name, dataDir) {
    const dirs = vscode.workspace.getConfiguration('latex-workshop').get('intellisense.package.dirs');
    dirs.push(dataDir);
    for (const dir of dirs) {
        const f = `${dir}/${name}`;
        if (fs.existsSync(f)) {
            return f;
        }
    }
    // Many package with names like toppackage-config.sty are just wrappers around
    // the general package toppacke.sty and do not define commands on their own.
    const suffix = name.substring(name.lastIndexOf('_'));
    const indexDash = name.lastIndexOf('-');
    if (indexDash > -1) {
        const generalPkg = name.substring(0, indexDash);
        const f = `${dataDir}/${generalPkg}${suffix}`;
        if (fs.existsSync(f)) {
            return f;
        }
    }
    return undefined;
}
exports.resolveCmdEnvFile = resolveCmdEnvFile;
class CommandFinder {
    constructor(extension) {
        this.definedCmds = new Map();
        this.extension = extension;
    }
    getCmdFromNodeArray(file, nodes, cmdList = []) {
        let cmds = [];
        nodes.forEach(node => {
            cmds = cmds.concat(this.getCmdFromNode(file, node, cmdList));
        });
        return cmds;
    }
    getCmdFromNode(file, node, cmdList = []) {
        const cmds = [];
        if (latex_utensils_1.latexParser.isDefCommand(node)) {
            const name = node.token.slice(1);
            if (!cmdList.includes(name)) {
                const cmd = {
                    label: `\\${name}`,
                    kind: vscode.CompletionItemKind.Function,
                    documentation: '`' + name + '`',
                    insertText: new vscode.SnippetString(name + this.getArgsFromNode(node)),
                    filterText: name,
                    package: ''
                };
                if (isTriggerSuggestNeeded(name)) {
                    cmd.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
                }
                cmds.push(cmd);
                cmdList.push(name);
            }
        }
        else if (latex_utensils_1.latexParser.isCommand(node)) {
            if (!cmdList.includes(node.name)) {
                const cmd = {
                    label: `\\${node.name}`,
                    kind: vscode.CompletionItemKind.Function,
                    documentation: '`' + node.name + '`',
                    insertText: new vscode.SnippetString(node.name + this.getArgsFromNode(node)),
                    filterText: node.name,
                    package: this.whichPackageProvidesCommand(node.name)
                };
                if (isTriggerSuggestNeeded(node.name)) {
                    cmd.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
                }
                cmds.push(cmd);
                cmdList.push(node.name);
            }
            if (['newcommand', 'renewcommand', 'providecommand', 'DeclareMathOperator', 'DeclarePairedDelimiter', 'DeclarePairedDelimiterX', 'DeclarePairedDelimiterXPP'].includes(node.name.replace(/\*$/, '')) &&
                Array.isArray(node.args) && node.args.length > 0) {
                const label = node.args[0].content[0].name;
                let args = '';
                if (latex_utensils_1.latexParser.isOptionalArg(node.args[1])) {
                    const numArgs = parseInt(node.args[1].content[0].content);
                    for (let i = 1; i <= numArgs; ++i) {
                        args += '{${' + i + '}}';
                    }
                }
                if (!cmdList.includes(label)) {
                    const cmd = {
                        label: `\\${label}`,
                        kind: vscode.CompletionItemKind.Function,
                        documentation: '`' + label + '`',
                        insertText: new vscode.SnippetString(label + args),
                        filterText: label,
                        package: 'user-defined'
                    };
                    if (isTriggerSuggestNeeded(label)) {
                        cmd.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
                    }
                    cmds.push(cmd);
                    this.definedCmds.set(label, {
                        file,
                        location: new vscode.Location(vscode.Uri.file(file), new vscode.Position(node.location.start.line - 1, node.location.start.column))
                    });
                    cmdList.push(label);
                }
            }
        }
        if (latex_utensils_1.latexParser.hasContentArray(node)) {
            return cmds.concat(this.getCmdFromNodeArray(file, node.content, cmdList));
        }
        return cmds;
    }
    getArgsFromNode(node) {
        let args = '';
        if (!('args' in node)) {
            return args;
        }
        let index = 0;
        if (latex_utensils_1.latexParser.isCommand(node)) {
            node.args.forEach(arg => {
                ++index;
                if (latex_utensils_1.latexParser.isOptionalArg(arg)) {
                    args += '[${' + index + '}]';
                }
                else {
                    args += '{${' + index + '}}';
                }
            });
            return args;
        }
        if (latex_utensils_1.latexParser.isDefCommand(node)) {
            node.args.forEach(arg => {
                ++index;
                if (latex_utensils_1.latexParser.isCommandParameter(arg)) {
                    args += '{${' + index + '}}';
                }
            });
            return args;
        }
        return args;
    }
    getCmdFromContent(file, content) {
        const cmdReg = /\\([a-zA-Z@_]+(?::[a-zA-Z]*)?\*?)({[^{}]*})?({[^{}]*})?({[^{}]*})?/g;
        const cmds = [];
        const cmdList = [];
        let explSyntaxOn = false;
        while (true) {
            const result = cmdReg.exec(content);
            if (result === null) {
                break;
            }
            if (result[1] === 'ExplSyntaxOn') {
                explSyntaxOn = true;
                continue;
            }
            else if (result[1] === 'ExplSyntaxOff') {
                explSyntaxOn = false;
                continue;
            }
            if (!explSyntaxOn) {
                const len = result[1].search(/[_:]/);
                if (len > -1) {
                    result[1] = result[1].slice(0, len);
                }
            }
            if (cmdList.includes(result[1])) {
                continue;
            }
            const cmd = {
                label: `\\${result[1]}`,
                kind: vscode.CompletionItemKind.Function,
                documentation: '`' + result[1] + '`',
                insertText: new vscode.SnippetString(this.getArgsFromRegResult(result)),
                filterText: result[1],
                package: this.whichPackageProvidesCommand(result[1])
            };
            if (isTriggerSuggestNeeded(result[1])) {
                cmd.command = { title: 'Post-Action', command: 'editor.action.triggerSuggest' };
            }
            cmds.push(cmd);
            cmdList.push(result[1]);
        }
        const newCommandReg = /\\(?:(?:(?:re|provide)?(?:new)?command)|(?:DeclarePairedDelimiter(?:X|XPP)?)|DeclareMathOperator)\*?{?\\(\w+)}?(?:\[([1-9])\])?/g;
        while (true) {
            const result = newCommandReg.exec(content);
            if (result === null) {
                break;
            }
            if (cmdList.includes(result[1])) {
                continue;
            }
            let args = '';
            if (result[2]) {
                const numArgs = parseInt(result[2]);
                for (let i = 1; i <= numArgs; ++i) {
                    args += '{${' + i + '}}';
                }
            }
            const cmd = {
                label: `\\${result[1]}`,
                kind: vscode.CompletionItemKind.Function,
                documentation: '`' + result[1] + '`',
                insertText: new vscode.SnippetString(result[1] + args),
                filterText: result[1],
                package: 'user-defined'
            };
            cmds.push(cmd);
            cmdList.push(result[1]);
            this.definedCmds.set(result[1], {
                file,
                location: new vscode.Location(vscode.Uri.file(file), new vscode.Position(content.substr(0, result.index).split('\n').length - 1, 0))
            });
        }
        return cmds;
    }
    getArgsFromRegResult(result) {
        let text = result[1];
        if (result[2]) {
            text += '{${1}}';
        }
        if (result[3]) {
            text += '{${2}}';
        }
        if (result[4]) {
            text += '{${3}}';
        }
        return text;
    }
    /**
     * Return the name of the package providing cmdName among all the packages
     * including in the rootFile. If no package matches, return ''
     *
     * @param cmdName the name of a command (without the leading '\')
     */
    whichPackageProvidesCommand(cmdName) {
        var _a;
        if (this.extension.manager.rootFile !== undefined) {
            for (const file of this.extension.manager.getIncludedTeX()) {
                const cachedPkgs = (_a = this.extension.manager.getCachedContent(file)) === null || _a === void 0 ? void 0 : _a.element.package;
                if (cachedPkgs === undefined) {
                    continue;
                }
                for (const pkg of cachedPkgs) {
                    const commands = [];
                    this.extension.completer.command.provideCmdInPkg(pkg, commands, []);
                    for (const cmd of commands) {
                        const label = cmd.label.slice(1);
                        if (label.startsWith(cmdName) &&
                            ((label.length === cmdName.length) ||
                                (label.charAt(cmdName.length) === '[') ||
                                (label.charAt(cmdName.length) === '{'))) {
                            return pkg;
                        }
                    }
                }
            }
        }
        return '';
    }
}
exports.CommandFinder = CommandFinder;
//# sourceMappingURL=commandfinder.js.map