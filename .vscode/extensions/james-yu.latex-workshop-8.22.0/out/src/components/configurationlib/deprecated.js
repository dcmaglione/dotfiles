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
exports.DeprecatedConfiguration = void 0;
const vscode = __importStar(require("vscode"));
class DeprecatedConfiguration {
    constructor(extension) {
        this.deprecatedConfigurations = [];
        this.extension = extension;
    }
    check() {
        const configuration = vscode.workspace.getConfiguration();
        for (const conf of this.deprecatedConfigurations) {
            const hasConf = configuration.has(conf.oldConfigKey);
            if (hasConf) {
                let msg;
                if (conf.newConfigKey) {
                    msg = `"${conf.oldConfigKey}" has been replaced by "${conf.newConfigKey}".`;
                }
                else {
                    msg = `"${conf.oldConfigKey}" has been deprecated.`;
                }
                if (conf.message) {
                    msg = msg + ' ' + conf.message;
                }
                else {
                    msg = msg + ' ' + 'Please manually remove the deprecated config from your settings.';
                }
                this.extension.logger.addLogMessage(`Deprecated configuration is used: ${conf.oldConfigKey}`);
                this.extension.logger.displayStatus('check', 'statusBar.foreground', msg, 'warning');
            }
        }
    }
}
exports.DeprecatedConfiguration = DeprecatedConfiguration;
//# sourceMappingURL=deprecated.js.map