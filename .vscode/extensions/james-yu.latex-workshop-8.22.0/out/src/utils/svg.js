"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.svgToDataUrl = void 0;
function svgToDataUrl(xml) {
    // We have to call encodeURIComponent and unescape because SVG can includes non-ASCII characters.
    // We have to encode them before converting them to base64.
    const svg64 = Buffer.from(unescape(encodeURIComponent(xml)), 'binary').toString('base64');
    const b64Start = 'data:image/svg+xml;base64,';
    return b64Start + svg64;
}
exports.svgToDataUrl = svgToDataUrl;
//# sourceMappingURL=svg.js.map