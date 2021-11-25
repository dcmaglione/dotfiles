"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodePathWithPrefix = exports.encodePathWithPrefix = exports.decodePath = exports.encodePath = exports.pdfFilePrefix = void 0;
/**
 * Prefix that server.ts uses to distiguish requests on pdf files from others.
 * We use '.' because it is not converted by encodeURIComponent and other functions.
 * See https://stackoverflow.com/questions/695438/safe-characters-for-friendly-url
 * See https://tools.ietf.org/html/rfc3986#section-2.3
 */
exports.pdfFilePrefix = 'pdf..';
/**
 * We encode the path with base64url after calling encodeURIComponent.
 * The reason not using base64url directly is that we are not sure that
 * encodeURIComponent, unescape, and btoa trick is valid on node.js.
 * - https://en.wikipedia.org/wiki/Base64#URL_applications
 * - https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings
 */
function encodePath(url) {
    const s = encodeURIComponent(url);
    const b64 = Buffer.from(s).toString('base64');
    const b64url = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return b64url;
}
exports.encodePath = encodePath;
function decodePath(b64url) {
    const tmp = b64url + '='.repeat((4 - b64url.length % 4) % 4);
    const b64 = tmp.replace(/-/g, '+').replace(/_/g, '/');
    const s = Buffer.from(b64, 'base64').toString();
    return decodeURIComponent(s);
}
exports.decodePath = decodePath;
function encodePathWithPrefix(pdfFilePath) {
    return exports.pdfFilePrefix + encodePath(pdfFilePath);
}
exports.encodePathWithPrefix = encodePathWithPrefix;
function decodePathWithPrefix(b64urlWithPrefix) {
    const s = b64urlWithPrefix.replace(exports.pdfFilePrefix, '');
    return decodePath(s);
}
exports.decodePathWithPrefix = decodePathWithPrefix;
//# sourceMappingURL=encodepath.js.map