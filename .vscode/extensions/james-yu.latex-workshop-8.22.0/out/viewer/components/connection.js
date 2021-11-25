export function createConnectionPort(lwApp) {
    return new WebSocketPort(lwApp);
}
export class WebSocketPort {
    constructor(lwApp) {
        this.lwApp = lwApp;
        const server = `ws://${window.location.hostname}:${window.location.port}`;
        this.server = server;
        this.socket = new Promise((resolve, reject) => {
            const sock = new WebSocket(server);
            sock.addEventListener('open', () => {
                resolve(sock);
            });
            sock.addEventListener('error', () => reject(new Error(`Failed to connect to ${server}`)));
        });
        this.startConnectionKeeper();
    }
    startConnectionKeeper() {
        // Send packets every 30 sec to prevent the connection closed by timeout.
        setInterval(() => {
            void this.send({ type: 'ping' });
        }, 30000);
    }
    async send(message) {
        const sock = await this.socket;
        if (sock.readyState === 1) {
            sock.send(JSON.stringify(message));
        }
    }
    async onDidReceiveMessage(cb) {
        const sock = await this.socket;
        sock.addEventListener('message', cb);
    }
    async onDidClose(cb) {
        const sock = await this.socket;
        sock.addEventListener('close', () => cb());
    }
    async onDidOpen(cb) {
        await this.socket;
        cb();
    }
}
//# sourceMappingURL=connection.js.map