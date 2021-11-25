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
exports.IntellisenseWatcher = void 0;
const events = __importStar(require("events"));
class IntellisenseWatcher {
    constructor() {
        this.cbSet = new Set();
        this.intellisenseEmitter = new events.EventEmitter();
        this.intellisenseEmitter.on('update', (file) => {
            this.cbSet.forEach((cb) => {
                cb(file);
            });
        });
    }
    onDidUpdateIntellisense(cb) {
        this.cbSet.add(cb);
        const diposable = {
            dipose: () => { this.cbSet.delete(cb); }
        };
        return diposable;
    }
    emitUpdate(file) {
        this.intellisenseEmitter.emit('update', file);
    }
}
exports.IntellisenseWatcher = IntellisenseWatcher;
//# sourceMappingURL=intellisensewatcher.js.map