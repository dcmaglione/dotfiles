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
exports.StructureTreeView = exports.Section = exports.SectionKind = exports.SectionNodeProvider = void 0;
const vscode = __importStar(require("vscode"));
const utils = __importStar(require("../utils/utils"));
const pathutils_1 = require("../components/managerlib/pathutils");
class SectionNodeProvider {
    constructor(extension) {
        this.extension = extension;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.root = '';
        // our data source is a set multi-rooted set of trees
        this.ds = [];
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        this.hierarchy = configuration.get('view.outline.sections');
        this.showLabels = configuration.get('view.outline.labels.enabled');
        this.showFloats = configuration.get('view.outline.floats.enabled');
        this.showNumbers = configuration.get('view.outline.numbers.enabled');
    }
    refresh() {
        if (this.extension.manager.rootFile) {
            this.ds = this.buildModel(new Set(), this.extension.manager.rootFile);
            return this.ds;
        }
        else {
            return [];
        }
    }
    update() {
        this._onDidChangeTreeData.fire(undefined);
    }
    /**
     * Compute the TOC of a LaTeX project. To only consider the current file, use `imports=false`
     * @param visitedFiles Set of files already visited. To avoid infinite loops
     * @param filePath The path of the file being parsed
     * @param fileStack The list of files inclusion leading to the current file
     * @param parentStack The list of parent sections
     * @param parentChildren The list of children of the parent Section
     * @param sectionNumber The number of the current section stored in an array with the same length this.hierarchy
     * @param imports Do we parse included files
     */
    buildModel(visitedFiles, filePath, fileStack, parentStack, parentChildren, sectionNumber, imports = true) {
        if (visitedFiles.has(filePath)) {
            return [];
        }
        else {
            visitedFiles.add(filePath);
        }
        let rootStack = [];
        if (parentStack) {
            rootStack = parentStack;
        }
        let children = [];
        if (parentChildren) {
            children = parentChildren;
        }
        let newFileStack = [];
        if (fileStack) {
            newFileStack = fileStack;
        }
        newFileStack.push(filePath);
        if (!sectionNumber) {
            sectionNumber = Array(this.hierarchy.length).fill(0);
        }
        let content = this.extension.manager.getDirtyContent(filePath);
        if (!content) {
            return children;
        }
        content = utils.stripCommentsAndVerbatim(content);
        const endPos = content.search(/\\end{document}/gm);
        if (endPos > -1) {
            content = content.substr(0, endPos);
        }
        const structureModel = new StructureModel(this.extension, filePath, rootStack, children, newFileStack, sectionNumber);
        const envNames = this.showFloats ? ['figure', 'frame', 'table'] : ['frame'];
        const lines = content.split('\n');
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const line = lines[lineNumber];
            // Environment part
            structureModel.buildEnvModel(envNames, lines, lineNumber);
            // Inputs part
            if (imports) {
                const inputFilePath = structureModel.buildImportModel(line);
                if (inputFilePath) {
                    this.buildModel(visitedFiles, inputFilePath, newFileStack, rootStack, children, sectionNumber);
                }
            }
            // Headings part
            structureModel.buildHeadingModel(lines, lineNumber, this.showNumbers);
            // Labels part
            if (this.showLabels) {
                structureModel.buildLabelModel(line, lineNumber, filePath);
            }
        }
        this.fixToLines(children);
        return children;
    }
    /**
     * Compute the exact ranges of every Section entry
     */
    fixToLines(sections, parentSection) {
        sections.forEach((entry, index) => {
            if (entry.kind !== SectionKind.Section) {
                return;
            }
            // Look for the next section with a smaller or equal depth
            let toLineSet = false;
            for (let i = index + 1; i < sections.length; i++) {
                if (entry.fileName === sections[i].fileName && sections[i].kind === SectionKind.Section && sections[i].depth <= entry.depth) {
                    entry.toLine = sections[i].lineNumber - 1;
                    toLineSet = true;
                    break;
                }
            }
            // If no closing section was found, use the parent section if any
            if (parentSection && !toLineSet && parentSection.fileName === entry.fileName) {
                entry.toLine = parentSection.toLine;
            }
            if (entry.children.length > 0) {
                this.fixToLines(entry.children, entry);
            }
        });
    }
    getTreeItem(element) {
        const hasChildren = element.children.length > 0;
        const treeItem = new vscode.TreeItem(element.label, hasChildren ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
        treeItem.command = {
            command: 'latex-workshop.goto-section',
            title: '',
            arguments: [element.fileName, element.lineNumber]
        };
        treeItem.tooltip = `Line ${element.lineNumber + 1} at ${element.fileName}`;
        return treeItem;
    }
    getChildren(element) {
        if (this.extension.manager.rootFile === undefined) {
            return [];
        }
        // if the root doesn't exist, we need
        // to explicitly build the model from disk
        if (!element) {
            return this.refresh();
        }
        return element.children;
    }
    getParent(element) {
        if (this.extension.manager.rootFile === undefined || !element) {
            return undefined;
        }
        return element.parent;
    }
}
exports.SectionNodeProvider = SectionNodeProvider;
var SectionKind;
(function (SectionKind) {
    SectionKind[SectionKind["Env"] = 0] = "Env";
    SectionKind[SectionKind["Label"] = 1] = "Label";
    SectionKind[SectionKind["Section"] = 2] = "Section";
})(SectionKind = exports.SectionKind || (exports.SectionKind = {}));
class Section extends vscode.TreeItem {
    constructor(kind, label, collapsibleState, depth, lineNumber, toLine, fileName, command) {
        super(label, collapsibleState);
        this.kind = kind;
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.depth = depth;
        this.lineNumber = lineNumber;
        this.toLine = toLine;
        this.fileName = fileName;
        this.command = command;
        this.children = [];
        this.parent = undefined; // The parent of a top level section must be undefined
        this.subfiles = [];
    }
}
exports.Section = Section;
class StructureModel {
    constructor(extension, filePath, rootStack, children, fileStack, sectionNumber) {
        this.extension = extension;
        this.filePath = filePath;
        this.rootStack = rootStack;
        this.children = children;
        this.fileStack = fileStack;
        this.sectionNumber = sectionNumber;
        this.envStack = [];
        this.sectionDepths = Object.create(null);
        this.prevSection = undefined;
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        this.hierarchy = configuration.get('view.outline.sections');
        this.hierarchy.forEach((section, index) => {
            section.split('|').forEach(sec => {
                this.sectionDepths[sec] = index;
            });
        });
        let pattern = '\\\\(';
        this.hierarchy.forEach((section, index) => {
            pattern += section;
            if (index < this.hierarchy.length - 1) {
                pattern += '|';
            }
        });
        pattern += ')(\\*)?(?:\\[[^\\[\\]\\{\\}]*\\])?{(.*)}';
        this.headerPattern = pattern;
    }
    currentRoot() {
        return this.rootStack[this.rootStack.length - 1];
    }
    noRoot() {
        return this.rootStack.length === 0;
    }
    buildEnvModel(envNames, lines, lineNumber) {
        const envReg = RegExp(`(?:\\\\(begin|end)(?:\\[[^[\\]]*\\])?){(?:(${envNames.join('|')})\\*?)}`, 'm');
        const line = lines[lineNumber];
        const result = envReg.exec(line);
        if (result && result[1] === 'begin') {
            this.envStack.push({ name: result[2], start: lineNumber, end: lineNumber });
        }
        else if (result && result[2] === this.envStack[this.envStack.length - 1].name) {
            const env = this.envStack.pop();
            if (!env) {
                return;
            }
            env.end = lineNumber;
            const caption = this.getCaptionOrTitle(lines, env);
            if (!caption) {
                return;
            }
            const depth = this.noRoot() ? 0 : this.currentRoot().depth + 1;
            const newEnv = new Section(SectionKind.Env, `${env.name.charAt(0).toUpperCase() + env.name.slice(1)}: ${caption}`, vscode.TreeItemCollapsibleState.Expanded, depth, env.start, env.end, this.filePath);
            if (this.noRoot()) {
                this.children.push(newEnv);
            }
            else {
                this.currentRoot().children.push(newEnv);
            }
        }
    }
    buildImportModel(line) {
        const pathRegexp = new pathutils_1.PathRegExp();
        const matchPath = pathRegexp.exec(line);
        if (!matchPath) {
            return undefined;
        }
        // zoom into this file
        const inputFilePath = pathRegexp.parseInputFilePath(matchPath, this.filePath, this.extension.manager.rootFile ? this.extension.manager.rootFile : this.filePath);
        if (!inputFilePath) {
            this.extension.logger.addLogMessage(`Could not resolve included file ${inputFilePath}`);
            return undefined;
        }
        // Avoid circular inclusion
        if (inputFilePath === this.filePath || this.fileStack.includes(inputFilePath)) {
            return undefined;
        }
        if (this.prevSection) {
            this.prevSection.subfiles.push(inputFilePath);
        }
        return inputFilePath;
    }
    buildLabelModel(line, lineNumber, filePath) {
        const labelReg = /\\label{([^}]*)}/m;
        const result = labelReg.exec(line);
        if (!result) {
            return;
        }
        const depth = this.noRoot() ? 0 : this.currentRoot().depth + 1;
        const newLabel = new Section(SectionKind.Label, `#Label: ${result[1]}`, vscode.TreeItemCollapsibleState.None, depth, lineNumber, lineNumber, filePath);
        if (this.noRoot()) {
            this.children.push(newLabel);
        }
        else {
            this.currentRoot().children.push(newLabel);
        }
    }
    buildHeadingModel(lines, lineNumber, showNumbers) {
        const line = lines[lineNumber];
        const headerReg = RegExp(this.headerPattern, 'm');
        const result = headerReg.exec(line);
        if (!result) {
            return;
        }
        // is it a section, a subsection, etc?
        const heading = result[1];
        const depth = this.sectionDepths[heading];
        const title = this.getSectionTitle(result[3]);
        let sectionNumberStr = '';
        if (result[2] === undefined) {
            this.incrementSectionNumber(depth);
            sectionNumberStr = this.formatSectionNumber(showNumbers);
        }
        const newSection = new Section(SectionKind.Section, sectionNumberStr + title, vscode.TreeItemCollapsibleState.Expanded, depth, lineNumber, lines.length - 1, this.filePath);
        this.prevSection = newSection;
        if (this.noRoot()) {
            this.children.push(newSection);
            this.rootStack.push(newSection);
            return;
        }
        // Find the proper root section
        while (!this.noRoot() && this.currentRoot().depth >= depth) {
            this.rootStack.pop();
        }
        if (this.noRoot()) {
            newSection.parent = undefined;
            this.children.push(newSection);
        }
        else {
            newSection.parent = this.currentRoot();
            this.currentRoot().children.push(newSection);
        }
        this.rootStack.push(newSection);
    }
    getCaptionOrTitle(lines, env) {
        const content = lines.slice(env.start, env.end).join('\n');
        let result = null;
        if (env.name === 'frame') {
            // Frame titles can be specified as either \begin{frame}{Frame Title}
            // or \begin{frame} \frametitle{Frame Title}
            const frametitleRegex = /\\frametitle(?:<[^<>]*>)?(?:\[[^[\]]*\])?{((?:[^{}]|(?:\{[^{}]*\})|\{[^{}]*\{[^{}]*\}[^{}]*\})+)}/gsm;
            // \begin{frame}(whitespace){Title} will set the title as long as the whitespace contains no more than 1 newline
            const beginframeRegex = /\\begin{frame}(?:<[^<>]*>?)?(?:\[[^[\]]*\]){0,2}[\t ]*(?:(?:\r\n|\r|\n)[\t ]*)?{((?:[^{}]|(?:\{[^{}]*\})|\{[^{}]*\{[^{}]*\}[^{}]*\})+)}/gsm;
            // \frametitle can override title set in \begin{frame}{<title>} so we check that first
            result = frametitleRegex.exec(content);
            if (!result) {
                result = beginframeRegex.exec(content);
            }
        }
        else {
            const captionRegex = /(?:\\caption(?:\[[^[\]]*\])?){((?:(?:[^{}])|(?:\{[^{}]*\}))+)}/gsm;
            let captionResult;
            // Take the last caption entry to deal with subfigures.
            // This works most of the time but not always. A definitive solution should use AST
            while ((captionResult = captionRegex.exec(content))) {
                result = captionResult;
            }
        }
        if (result) {
            // Remove indentation, newlines and the final '.'
            return result[1].replace(/^ */gm, ' ').replace(/\r|\n/g, '').replace(/\.$/, '');
        }
        return undefined;
    }
    /**
     * Return the title of a command while only keeping the second argument of \texorpdfstring
     * @param text a section command
     */
    getSectionTitle(text) {
        let title = utils.getLongestBalancedString(text);
        let pdfTitle = '';
        const regex = /\\texorpdfstring/;
        let res;
        while (true) {
            res = regex.exec(title);
            if (!res) {
                break;
            }
            pdfTitle += title.slice(0, res.index);
            title = title.slice(res.index);
            const arg = utils.getNthArgument(title, 2);
            if (!arg) {
                break;
            }
            pdfTitle += arg.arg;
            // Continue with the remaining text after the second arg
            title = title.slice(arg.index + arg.arg.length + 2); // 2 counts '{' and '}' around arg
        }
        return pdfTitle + title;
    }
    incrementSectionNumber(depth) {
        this.sectionNumber[depth] += 1;
        this.sectionNumber.forEach((_, index) => {
            if (index > depth) {
                this.sectionNumber[index] = 0;
            }
        });
    }
    formatSectionNumber(showNumbers) {
        if (!showNumbers) {
            return '';
        }
        let str = '';
        this.sectionNumber.forEach((value) => {
            if (str === '' && value === 0) {
                return;
            }
            if (str !== '') {
                str += '.';
            }
            str += value.toString();
        });
        return str.replace(/(\.0)*$/, '') + ' ';
    }
}
class StructureTreeView {
    constructor(extension) {
        this.extension = extension;
        this._followCursor = true;
        this._treeDataProvider = this.extension.structureProvider;
        this._viewer = vscode.window.createTreeView('latex-workshop-structure', { treeDataProvider: this._treeDataProvider, showCollapseAll: true });
        vscode.commands.registerCommand('latex-workshop.structure-toggle-follow-cursor', () => {
            this._followCursor = !this._followCursor;
        });
    }
    traverseSectionTree(sections, fileName, lineNumber) {
        let match = undefined;
        for (const node of sections) {
            if ((node.fileName === fileName && node.lineNumber <= lineNumber && node.toLine >= lineNumber)
                || (node.fileName !== fileName && node.subfiles.includes(fileName))) {
                match = node;
                // Look for a more precise surrounding section
                const res = this.traverseSectionTree(node.children, fileName, lineNumber);
                if (res) {
                    match = res;
                }
            }
        }
        return match;
    }
    showCursorItem(e) {
        if (!this._followCursor || !this._viewer.visible) {
            return;
        }
        const line = e.selections[0].active.line;
        const f = e.textEditor.document.fileName;
        const currentNode = this.traverseSectionTree(this._treeDataProvider.ds, f, line);
        if (currentNode) {
            return this._viewer.reveal(currentNode, { select: true });
        }
        return;
    }
}
exports.StructureTreeView = StructureTreeView;
//# sourceMappingURL=structure.js.map