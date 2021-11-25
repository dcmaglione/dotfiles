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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const http = __importStar(require("http"));
const ws_1 = __importDefault(require("ws"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const encodepath_1 = require("../utils/encodepath");
class WsServer extends ws_1.default.Server {
    constructor(server, extension, validOrigin) {
        super({ server });
        this.extension = extension;
        this.validOrigin = validOrigin;
    }
    //
    // Check Origin header during WebSocket handshake.
    // - https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#client_handshake_request
    // - https://github.com/websockets/ws/blob/master/doc/ws.md#servershouldhandlerequest
    //
    shouldHandle(req) {
        const reqOrigin = req.headers['origin'];
        if (reqOrigin !== undefined && reqOrigin !== this.validOrigin) {
            this.extension.logger.addLogMessage(`[Server] Origin in WebSocket upgrade request is invalid: ${JSON.stringify(req.headers)}`);
            this.extension.logger.addLogMessage(`[Server] Valid origin: ${this.validOrigin}`);
            return false;
        }
        else {
            return true;
        }
    }
}
class Server {
    constructor(extension) {
        this.extension = extension;
        this.httpServer = http.createServer((request, response) => this.handler(request, response));
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const viewerPort = configuration.get('viewer.pdf.internal.port');
        this.httpServer.listen(viewerPort, '127.0.0.1', undefined, () => {
            const address = this.httpServer.address();
            if (address && typeof address !== 'string') {
                this.address = address;
                this.extension.logger.addLogMessage(`[Server] Server successfully started: ${JSON.stringify(address)}`);
                this.initializeWsServer();
            }
            else {
                this.extension.logger.addLogMessage(`[Server] Server failed to start. Address is invalid: ${JSON.stringify(address)}`);
            }
        });
        this.httpServer.on('error', (err) => {
            this.extension.logger.addLogMessage(`[Server] Error creating LaTeX Workshop http server: ${JSON.stringify(err)}.`);
        });
        this.extension.logger.addLogMessage('[Server] Creating LaTeX Workshop http and websocket server.');
    }
    get port() {
        var _a;
        const portNum = (_a = this.address) === null || _a === void 0 ? void 0 : _a.port;
        if (portNum === undefined) {
            this.extension.logger.addLogMessage('Server port number is undefined.');
            throw new Error('Server port number is undefined.');
        }
        return portNum;
    }
    get validOrigin() {
        return `http://127.0.0.1:${this.port}`;
    }
    initializeWsServer() {
        const wsServer = new WsServer(this.httpServer, this.extension, this.validOrigin);
        wsServer.on('connection', (websocket) => {
            websocket.on('message', (msg) => this.extension.viewer.handler(websocket, msg));
            websocket.on('error', (err) => this.extension.logger.addLogMessage(`[Server] Error on WebSocket connection. ${JSON.stringify(err)}`));
        });
    }
    //
    // We reject cross-origin requests. The specification says "In case a server does not wish to participate in the CORS protocol,
    // ... The server is encouraged to use the 403 status in such HTTP responses."
    // - https://fetch.spec.whatwg.org/#http-requests
    // - https://fetch.spec.whatwg.org/#http-responses
    //
    checkHttpOrigin(req, response) {
        const reqOrigin = req.headers['origin'];
        if (reqOrigin !== undefined && reqOrigin !== this.validOrigin) {
            this.extension.logger.addLogMessage(`[Server] Origin in http request is invalid: ${JSON.stringify(req.headers)}`);
            this.extension.logger.addLogMessage(`[Server] Valid origin: ${this.validOrigin}`);
            response.writeHead(403);
            response.end();
            return false;
        }
        else {
            return true;
        }
    }
    handler(request, response) {
        if (!request.url) {
            return;
        }
        const isValidOrigin = this.checkHttpOrigin(request, response);
        if (!isValidOrigin) {
            return;
        }
        //
        // Headers to enable site isolation.
        // - https://fetch.spec.whatwg.org/#cross-origin-resource-policy-header
        // - https://www.w3.org/TR/post-spectre-webdev/#documents-isolated
        //
        const sameOriginPolicyHeaders = {
            'Cross-Origin-Resource-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'X-Content-Type-Options': 'nosniff'
        };
        if (request.url.includes(encodepath_1.pdfFilePrefix) && !request.url.includes('viewer.html')) {
            const s = request.url.replace('/', '');
            const fileName = (0, encodepath_1.decodePathWithPrefix)(s);
            if (this.extension.viewer.getClientSet(fileName) === undefined) {
                this.extension.logger.addLogMessage(`Invalid PDF request: ${fileName}`);
                return;
            }
            try {
                const pdfSize = fs.statSync(fileName).size;
                response.writeHead(200, Object.assign({ 'Content-Type': 'application/pdf', 'Content-Length': pdfSize }, sameOriginPolicyHeaders));
                fs.createReadStream(fileName).pipe(response);
                this.extension.logger.addLogMessage(`Preview PDF file: ${fileName}`);
            }
            catch (e) {
                this.extension.logger.addLogMessage(`Error reading PDF file: ${fileName}`);
                if (e instanceof Error) {
                    this.extension.logger.logError(e);
                }
                response.writeHead(404);
                response.end();
            }
            return;
        }
        else {
            let root;
            if (request.url.startsWith('/build/') || request.url.startsWith('/cmaps/') || request.url.startsWith('/standard_fonts/')) {
                root = path.resolve(`${this.extension.extensionRoot}/node_modules/pdfjs-dist`);
            }
            else if (request.url.startsWith('/out/viewer/') || request.url.startsWith('/viewer/')) {
                // For requests to /out/viewer/*.js and requests to /viewer/*.ts.
                // The latter is for debugging with sourcemap.
                root = path.resolve(this.extension.extensionRoot);
            }
            else {
                root = path.resolve(`${this.extension.extensionRoot}/viewer`);
            }
            //
            // Prevent directory traversal attack.
            // - https://en.wikipedia.org/wiki/Directory_traversal_attack
            //
            const reqFileName = path.posix.resolve('/', request.url.split('?')[0]);
            const fileName = path.resolve(root, '.' + reqFileName);
            let contentType;
            switch (path.extname(fileName)) {
                case '.html': {
                    contentType = 'text/html';
                    break;
                }
                case '.js': {
                    contentType = 'text/javascript';
                    break;
                }
                case '.css': {
                    contentType = 'text/css';
                    break;
                }
                case '.json': {
                    contentType = 'application/json';
                    break;
                }
                case '.png': {
                    contentType = 'image/png';
                    break;
                }
                case '.jpg': {
                    contentType = 'image/jpg';
                    break;
                }
                case '.gif': {
                    contentType = 'image/gif';
                    break;
                }
                case '.svg': {
                    contentType = 'image/svg+xml';
                    break;
                }
                case '.ico': {
                    contentType = 'image/x-icon';
                    break;
                }
                default: {
                    contentType = 'application/octet-stream';
                    break;
                }
            }
            fs.readFile(fileName, (err, content) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        response.writeHead(404);
                    }
                    else {
                        response.writeHead(500);
                    }
                    response.end();
                }
                else {
                    response.writeHead(200, Object.assign({ 'Content-Type': contentType }, sameOriginPolicyHeaders));
                    response.end(content);
                }
            });
        }
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map