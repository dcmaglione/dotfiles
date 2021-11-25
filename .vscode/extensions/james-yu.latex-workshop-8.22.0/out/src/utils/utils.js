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
exports.isNewCommand = exports.replaceArgumentPlaceholders = exports.resolveFile = exports.getNthArgument = exports.getSurroundingCommandRange = exports.getLongestBalancedString = exports.trimMultiLineString = exports.stripCommentsAndVerbatim = exports.stripEnvironments = exports.stripComments = exports.escapeRegExp = exports.escapeHtml = exports.sleep = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function escapeHtml(s) {
    return s.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
exports.escapeHtml = escapeHtml;
function escapeRegExp(str) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;
/**
 * Remove comments
 *
 * @param text A string in which comments get removed.
 * @return the input text with comments removed.
 * Note the number lines of the output matches the input
 */
function stripComments(text) {
    const reg = /(^|[^\\]|(?:(?<!\\)(?:\\\\)+))%.*$/gm;
    return text.replace(reg, '$1');
}
exports.stripComments = stripComments;
/**
 * Remove some environments
 * Note the number lines of the output matches the input
 *
 * @param text A string representing the content of a TeX file
 * @param envs An array of environments to be removed
 *
 */
function stripEnvironments(text, envs) {
    const envsAlt = envs.join('|');
    const pattern = `\\\\begin{(${envsAlt})}.*?\\\\end{\\1}`;
    const reg = RegExp(pattern, 'gms');
    return text.replace(reg, (match, ..._args) => {
        const len = Math.max(match.split('\n').length, 1);
        return '\n'.repeat(len - 1);
    });
}
exports.stripEnvironments = stripEnvironments;
/**
 * Remove comments and verbatim content
 * Note the number lines of the output matches the input
 *
 * @param text A multiline string to be stripped
 * @return the input text with comments and verbatim content removed.
 */
function stripCommentsAndVerbatim(text) {
    let content = stripComments(text);
    content = content.replace(/\\verb\*?([^a-zA-Z0-9]).*?\1/, '');
    const configuration = vscode.workspace.getConfiguration('latex-workshop');
    const verbatimEnvs = configuration.get('latex.verbatimEnvs');
    return stripEnvironments(content, verbatimEnvs);
}
exports.stripCommentsAndVerbatim = stripCommentsAndVerbatim;
/**
 * Trim leading and ending spaces on every line
 * See https://blog.stevenlevithan.com/archives/faster-trim-javascript for
 * possible ways of implementing trimming
 *
 * @param text a multiline string
 */
function trimMultiLineString(text) {
    return text.replace(/^\s\s*/gm, '').replace(/\s\s*$/gm, '');
}
exports.trimMultiLineString = trimMultiLineString;
/**
 * Find the longest substring containing balanced curly braces {...}
 * The string `s` can either start on the opening `{` or at the next character
 *
 * @param s A string to be searched.
 */
function getLongestBalancedString(s) {
    let nested = s[0] === '{' ? 0 : 1;
    let i = 0;
    for (i = 0; i < s.length; i++) {
        switch (s[i]) {
            case '{':
                nested++;
                break;
            case '}':
                nested--;
                break;
            case '\\':
                // skip an escaped character
                i++;
                break;
            default:
        }
        if (nested === 0) {
            break;
        }
    }
    return s.substring(s[0] === '{' ? 1 : 0, i);
}
exports.getLongestBalancedString = getLongestBalancedString;
/**
 * If the current position is inside command{...}, return the range of command{...} and its argument. Otherwise return undefined
 *
 * @param command the command name, with or without the leading '\\'
 * @param position the current position in the document
 * @param document a TextDocument
 */
function getSurroundingCommandRange(command, position, document) {
    if (!command.startsWith('\\')) {
        command = '\\' + command;
    }
    const line = document.lineAt(position.line).text;
    const regex = new RegExp('\\' + command + '{', 'g');
    while (true) {
        const match = regex.exec(line);
        if (!match) {
            break;
        }
        const matchPos = match.index;
        const openingBracePos = matchPos + command.length + 1;
        const arg = getLongestBalancedString(line.slice(openingBracePos));
        if (position.character >= openingBracePos && position.character <= openingBracePos + arg.length + 1) {
            const start = new vscode.Position(position.line, matchPos);
            const end = new vscode.Position(position.line, openingBracePos + arg.length + 1);
            return { range: new vscode.Range(start, end), arg };
        }
    }
    return undefined;
}
exports.getSurroundingCommandRange = getSurroundingCommandRange;
/**
 * @param text a string starting with a command call
 * @param nth the index of the argument to return
 */
function getNthArgument(text, nth) {
    let arg = '';
    let index = 0; // start of the nth argument
    let offset = 0; // current offset of the new text to consider
    for (let i = 0; i < nth; i++) {
        text = text.slice(offset);
        index += offset;
        const start = text.indexOf('{');
        if (start === -1) {
            return undefined;
        }
        text = text.slice(start);
        index += start;
        arg = getLongestBalancedString(text);
        offset = arg.length + 2; // 2 counts '{' and '}'
    }
    return { arg, index };
}
exports.getNthArgument = getNthArgument;
/**
 * Resolve a relative file path to an absolute path using the prefixes `dirs`.
 *
 * @param dirs An array of the paths of directories. They are used as prefixes for `inputFile`.
 * @param inputFile The path of a input file to be resolved.
 * @param suffix The suffix of the input file
 * @return an absolute path or undefined if the file does not exist
 */
function resolveFile(dirs, inputFile, suffix = '.tex') {
    if (inputFile.startsWith('/')) {
        dirs.unshift('');
    }
    for (const d of dirs) {
        let inputFilePath = path.resolve(d, inputFile);
        if (path.extname(inputFilePath) === '') {
            inputFilePath += suffix;
        }
        if (!fs.existsSync(inputFilePath) && fs.existsSync(inputFilePath + suffix)) {
            inputFilePath += suffix;
        }
        if (fs.existsSync(inputFilePath)) {
            return inputFilePath;
        }
    }
    return undefined;
}
exports.resolveFile = resolveFile;
/**
 * Return a function replacing placeholders of LaTeX recipes.
 *
 * @param rootFile The path of the root file.
 * @param tmpDir The path of a temporary directory.
 * @returns A function replacing placeholders.
 */
function replaceArgumentPlaceholders(rootFile, tmpDir) {
    return (arg) => {
        var _a;
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const docker = configuration.get('docker.enabled');
        const workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
        const workspaceDir = (workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri.fsPath.split(path.sep).join('/')) || '';
        const rootFileParsed = path.parse(rootFile);
        const docfile = rootFileParsed.name;
        const docfileExt = rootFileParsed.base;
        const dirW32 = path.normalize(rootFileParsed.dir);
        const dir = dirW32.split(path.sep).join('/');
        const docW32 = path.join(dirW32, docfile);
        const doc = docW32.split(path.sep).join('/');
        const docExtW32 = path.join(dirW32, docfileExt);
        const docExt = docExtW32.split(path.sep).join('/');
        const expandPlaceHolders = (a) => {
            return a.replace(/%DOC%/g, docker ? docfile : doc)
                .replace(/%DOC_W32%/g, docker ? docfile : docW32)
                .replace(/%DOC_EXT%/g, docker ? docfileExt : docExt)
                .replace(/%DOC_EXT_W32%/g, docker ? docfileExt : docExtW32)
                .replace(/%DOCFILE_EXT%/g, docfileExt)
                .replace(/%DOCFILE%/g, docfile)
                .replace(/%DIR%/g, docker ? './' : dir)
                .replace(/%DIR_W32%/g, docker ? './' : dirW32)
                .replace(/%TMPDIR%/g, tmpDir)
                .replace(/%WORKSPACE_FOLDER%/g, docker ? './' : workspaceDir)
                .replace(/%RELATIVE_DIR%/, docker ? './' : path.relative(workspaceDir, dir))
                .replace(/%RELATIVE_DOC%/, docker ? docfile : path.relative(workspaceDir, doc));
        };
        const outDirW32 = path.normalize(expandPlaceHolders(configuration.get('latex.outDir')));
        const outDir = outDirW32.split(path.sep).join('/');
        return expandPlaceHolders(arg).replace(/%OUTDIR%/g, outDir).replace(/%OUTDIR_W32%/g, outDirW32);
    };
}
exports.replaceArgumentPlaceholders = replaceArgumentPlaceholders;
function isNewCommand(node) {
    const regex = /^(renewcommand|newcommand|providecommand|DeclareMathOperator)(\*)?$/;
    if (!!node && node.kind === 'command' && node.name.match(regex)) {
        return true;
    }
    return false;
}
exports.isNewCommand = isNewCommand;
//# sourceMappingURL=utils.js.map