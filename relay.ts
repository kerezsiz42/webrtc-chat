export type RelayMessage = {
  id: string;
  payload: string;
};

export class Relay {
  #socketToId = new Map<WebSocket, string>();
  #idToSockets = new Map<string, WebSocket[]>();
  #broadcastChannel = new BroadcastChannel("relay");

  constructor(signal?: AbortSignal) {
    signal?.addEventListener("abort", () => {
      this.#broadcastChannel.close();
      for (const socket of this.#socketToId.keys()) {
        socket.close();
        this.remove(socket);
      }
    });

    this.#broadcastChannel.onmessage = (ev: MessageEvent<RelayMessage>) => {
      this.#sendToSocketsInternally(ev.data);
    };
  }

  add(id: string, socket: WebSocket) {
    this.#socketToId.set(socket, id);
    const sockets = this.#idToSockets.get(id) || [];
    this.#idToSockets.set(id, [...sockets, socket]);
  }

  remove(socket: WebSocket) {
    const id = this.#socketToId.get(socket) || "";
    const sockets = this.#idToSockets.get(id) || [];
    if (sockets.length > 1) {
      this.#idToSockets.set(
        id,
        sockets.filter((s) => s !== socket)
      );
    } else {
      this.#idToSockets.delete(id);
    }
    this.#socketToId.delete(socket);
  }

  #sendToSocketsInternally(message: RelayMessage) {
    for (const socket of this.#idToSockets.get(message.id) || []) {
      socket.send(message.payload);
    }
  }

  send(message: RelayMessage) {
    this.#broadcastChannel.postMessage(message);
    this.#sendToSocketsInternally(message);
  }
}
