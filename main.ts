import {
  CONTENT_TYPE_JSON,
  CONTENT_TYPE_PLAIN,
  serveStaticAsset,
} from "./assets.ts";
import { log } from "./log.js";
import { Relay } from "./relay.ts";

function handleGetRequest(r: Request): Response {
  if (r.headers.get("upgrade") === "websocket") {
    const url = new URL(r.url);
    const id = url.pathname.split("/").at(-1);
    if (!id) {
      return new Response("Unauthorized", {
        headers: {
          "Content-Type": CONTENT_TYPE_PLAIN,
        },
        status: 401,
      });
    }

    const { socket, response } = Deno.upgradeWebSocket(r);

    socket.onopen = () => {
      log("INFO", "New client connected to WebSocket server");
      relay.add(id, socket);
    };

    socket.onclose = () => {
      log("INFO", "Client disconnected from WebSocket server");
      relay.remove(socket);
    };

    socket.onerror = () => {
      log("ERROR", "Error during WebSocket connection");
    };

    return response;
  }

  return serveStaticAsset(r);
}

function respond(data: any): Response {
  const json = JSON.stringify(data);
  return new Response(json, {
    headers: {
      "Content-Type": CONTENT_TYPE_JSON,
    },
  });
}

async function handlePublish(r: Request) {
  const data = await r.json();
  return respond(data);
}

function handleRequest(r: Request) {
  if (r.method === "GET") {
    return handleGetRequest(r);
  }

  const url = new URL(r.url);
  if (url.pathname.endsWith("publish")) {
    return handlePublish(r);
  }

  return new Response("Bad Request: no such operation", {
    headers: {
      "Content-Type": CONTENT_TYPE_PLAIN,
    },
    status: 400,
  });
}

function onListen({ hostname, port }: Deno.NetAddr) {
  log("INFO", "HTTP server started", {
    hostname,
    port,
  });
}

function shutdown() {
  log("INFO", "Server shutdown initiated...");
  ac.abort();
}

const ac = new AbortController();
const relay = Relay.getInstance(ac.signal);
Deno.serve({ onListen, signal: ac.signal }, handleRequest);
Deno.addSignalListener("SIGTERM", shutdown);
Deno.addSignalListener("SIGINT", shutdown);
