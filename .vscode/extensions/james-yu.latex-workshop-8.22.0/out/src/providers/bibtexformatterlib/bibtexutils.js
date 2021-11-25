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
exports.BibtexUtils = void 0;
const vscode = __importStar(require("vscode"));
const latex_utensils_1 = require("latex-utensils");
/**
 * Read the indentation from vscode configuration
 *
 * @param tab VSCode configuration for bibtex-format.tab
 * @return the indentation as a string or undefined if the configuration variable is not correct
 */
function getBibtexFormatTab(tab) {
    if (tab === 'tab') {
        return '\t';
    }
    else {
        const res = /^(\d+)( spaces)?$/.exec(tab);
        if (res) {
            const nSpaces = parseInt(res[1], 10);
            return ' '.repeat(nSpaces);
        }
        else {
            return undefined;
        }
    }
}
class BibtexUtils {
    constructor(extension) {
        this.extension = extension;
        const config = vscode.workspace.getConfiguration('latex-workshop');
        const leftright = config.get('bibtex-format.surround') === 'Curly braces' ? ['{', '}'] : ['"', '"'];
        let tabs = getBibtexFormatTab(config.get('bibtex-format.tab'));
        if (tabs === undefined) {
            this.extension.logger.addLogMessage(`Wrong value for bibtex-format.tab: ${config.get('bibtex-format.tab')}`);
            this.extension.logger.addLogMessage('Setting bibtex-format.tab to \'2 spaces\'');
            tabs = '  ';
        }
        this.bibtexFormatConfig = {
            tab: tabs,
            case: config.get('bibtex-format.case'),
            left: leftright[0],
            right: leftright[1],
            trailingComma: config.get('bibtex-format.trailingComma'),
            sort: config.get('bibtex-format.sortby'),
            alignOnEqual: config.get('bibtex-format.align-equal.enabled'),
            sortFields: config.get('bibtex-fields.sort.enabled'),
            fieldsOrder: config.get('bibtex-fields.order'),
            firstEntries: config.get('bibtex-entries.first')
        };
        this.extension.logger.addLogMessage(`Bibtex format config: ${JSON.stringify(this.bibtexFormatConfig)}`);
    }
    /**
     * Sorting function for bibtex entries
     * @param keys Array of sorting keys
     */
    bibtexSort(duplicates) {
        const keys = this.bibtexFormatConfig.sort;
        return (a, b) => {
            let r = 0;
            for (const key of keys) {
                // Select the appropriate sort function
                switch (key) {
                    case 'key':
                        r = this.bibtexSortByKey(a, b);
                        break;
                    case 'year-desc':
                        r = -this.bibtexSortByField('year', a, b);
                        break;
                    case 'type':
                        r = this.bibtexSortByType(a, b);
                        break;
                    default:
                        r = this.bibtexSortByField(key, a, b);
                }
                // Compare until different
                if (r !== 0) {
                    break;
                }
            }
            if (r === 0 && latex_utensils_1.bibtexParser.isEntry(a)) {
                // It seems that items earlier in the list appear as the variable b here, rather than a
                duplicates.add(a);
            }
            return r;
        };
    }
    /**
     * If one of the entries `a` or `b` is in `firstEntries` or `stickyEntries`, return an order.
     * Otherwise, return undefined
     */
    bibtexSortFirstEntries(firstEntries, a, b) {
        const aFirst = firstEntries.includes(a.entryType);
        const bFirst = firstEntries.includes(b.entryType);
        if (aFirst && !bFirst) {
            return -1;
        }
        else if (!aFirst && bFirst) {
            return 1;
        }
        else if (aFirst && bFirst) {
            const aIndex = firstEntries.indexOf(a.entryType);
            const bIndex = firstEntries.indexOf(b.entryType);
            if (aIndex <= bIndex) {
                return -1;
            }
            else {
                return 1;
            }
        }
        return undefined;
    }
    /**
     * Handles all sorting keys that are some bibtex field name
     * @param fieldName which field name to sort by
     */
    bibtexSortByField(fieldName, a, b) {
        const firstEntriesOrder = this.bibtexSortFirstEntries(this.bibtexFormatConfig.firstEntries, a, b);
        if (firstEntriesOrder) {
            return firstEntriesOrder;
        }
        let fieldA = '';
        let fieldB = '';
        if (latex_utensils_1.bibtexParser.isEntry(a)) {
            for (let i = 0; i < a.content.length; i++) {
                if (a.content[i].name === fieldName) {
                    fieldA = this.fieldToString(a.content[i].value, '');
                    break;
                }
            }
        }
        if (latex_utensils_1.bibtexParser.isEntry(b)) {
            for (let i = 0; i < b.content.length; i++) {
                if (b.content[i].name === fieldName) {
                    fieldB = this.fieldToString(b.content[i].value, '');
                    break;
                }
            }
        }
        // Remove braces to sort properly
        fieldA = fieldA.replace(/{|}/g, '');
        fieldB = fieldB.replace(/{|}/g, '');
        return fieldA.localeCompare(fieldB);
    }
    bibtexSortByKey(a, b) {
        const firstEntriesOrder = this.bibtexSortFirstEntries(this.bibtexFormatConfig.firstEntries, a, b);
        let aKey = undefined;
        let bKey = undefined;
        if (latex_utensils_1.bibtexParser.isEntry(a)) {
            aKey = a.internalKey;
        }
        if (latex_utensils_1.bibtexParser.isEntry(b)) {
            bKey = b.internalKey;
        }
        if (firstEntriesOrder) {
            return firstEntriesOrder;
        }
        if (!aKey && !bKey) {
            return 0;
        }
        else if (!aKey) {
            return -1; // sort undefined keys first
        }
        else if (!bKey) {
            return 1;
        }
        else {
            return aKey.localeCompare(bKey);
        }
    }
    bibtexSortByType(a, b) {
        const firstEntriesOrder = this.bibtexSortFirstEntries(this.bibtexFormatConfig.firstEntries, a, b);
        if (firstEntriesOrder) {
            return firstEntriesOrder;
        }
        return a.entryType.localeCompare(b.entryType);
    }
    /**
     * Creates an aligned string from a bibtexParser.Entry
     * @param entry the bibtexParser.Entry
     */
    bibtexFormat(entry) {
        let s = '';
        s += '@' + entry.entryType + '{' + (entry.internalKey ? entry.internalKey : '');
        // Find the longest field name in entry
        let maxFieldLength = 0;
        if (this.bibtexFormatConfig.alignOnEqual) {
            entry.content.forEach(field => {
                maxFieldLength = Math.max(maxFieldLength, field.name.length);
            });
        }
        let fields = entry.content;
        if (this.bibtexFormatConfig.sortFields) {
            fields = entry.content.sort(this.bibtexSortFields(this.bibtexFormatConfig.fieldsOrder));
        }
        fields.forEach(field => {
            s += ',\n' + this.bibtexFormatConfig.tab + (this.bibtexFormatConfig.case === 'lowercase' ? field.name : field.name.toUpperCase());
            let indent = this.bibtexFormatConfig.tab + ' '.repeat(field.name.length);
            if (this.bibtexFormatConfig.alignOnEqual) {
                const adjustedLength = ' '.repeat(maxFieldLength - field.name.length);
                s += adjustedLength;
                indent += adjustedLength;
            }
            s += ' = ';
            indent += ' '.repeat(' = '.length + this.bibtexFormatConfig.left.length);
            s += this.fieldToString(field.value, indent);
        });
        if (this.bibtexFormatConfig.trailingComma) {
            s += ',';
        }
        s += '\n}';
        return s;
    }
    /**
     * Convert a bibtexParser.FieldValue to a string
     * @param field the bibtexParser.FieldValue to parse
     * @param prefix what to add to every but the first line of a multiline field.
     */
    fieldToString(field, prefix) {
        const left = this.bibtexFormatConfig.left;
        const right = this.bibtexFormatConfig.right;
        switch (field.kind) {
            case 'abbreviation':
            case 'number':
                return field.content;
            case 'text_string': {
                if (prefix !== '') {
                    const lines = field.content.split(/\r\n|\r|\n/g);
                    for (let i = 1; i < lines.length; i++) {
                        lines[i] = prefix + lines[i].trimLeft();
                    }
                    return left + lines.join('\n') + right;
                }
                else {
                    return left + field.content + right;
                }
            }
            case 'concat':
                return field.content.map(value => this.fieldToString(value, prefix)).reduce((acc, cur) => { return acc + ' # ' + cur; });
            default:
                return '';
        }
    }
    /**
     * Sorting function for bibtex entries
     * @param keys Array of sorting keys
     */
    bibtexSortFields(keys) {
        return function (a, b) {
            const indexA = keys.indexOf(a.name);
            const indexB = keys.indexOf(b.name);
            if (indexA === -1 && indexB === -1) {
                return a.name.localeCompare(b.name);
            }
            else if (indexA === -1) {
                return 1;
            }
            else if (indexB === -1) {
                return -1;
            }
            else {
                return indexA - indexB;
            }
        };
    }
}
exports.BibtexUtils = BibtexUtils;
//# sourceMappingURL=bibtexutils.js.map