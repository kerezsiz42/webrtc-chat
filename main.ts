import { serveStaticAsset } from "./assets.ts";
import {
  CONTENT_TYPE_HEADER,
  CONTENT_TYPE_JSON,
  CONTENT_TYPE_PLAIN,
} from "./contentType.js";
import { log } from "./log.js";
import { parsePublishData } from "./parsers.ts";
import { Relay } from "./relay.ts";

function handleGetRequest(r: Request): Response {
  if (r.headers.get("upgrade") === "websocket") {
    const id = r.url.split("/").at(-1);
    if (!id) {
      return new Response("you must provide an id in url path", {
        headers: {
          [CONTENT_TYPE_HEADER]: CONTENT_TYPE_PLAIN,
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
      [CONTENT_TYPE_HEADER]: CONTENT_TYPE_JSON,
    },
  });
}

async function handlePublish(r: Request) {
  const data = await r.json();

  const [err, publishData] = parsePublishData(data);
  if (err !== null) {
    return new Response(`error while parsing PublishData: ${err.message}`, {
      headers: {
        [CONTENT_TYPE_HEADER]: CONTENT_TYPE_PLAIN,
      },
      status: 400,
    });
  }

  relay.send(publishData);

  return respond("ok");
}

function handleRequest(r: Request) {
  if (r.method === "GET") {
    return handleGetRequest(r);
  }

  const operation = r.url.split("/").at(-1) || "undefined";
  if (operation === "publish") {
    return handlePublish(r);
  }

  return new Response(`no such operation: ${operation}`, {
    headers: {
      [CONTENT_TYPE_HEADER]: CONTENT_TYPE_PLAIN,
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

log("INFO", "Process started", { pid: Deno.pid });
const ac = new AbortController();
const relay = new Relay(ac.signal);
Deno.addSignalListener("SIGTERM", shutdown);
Deno.addSignalListener("SIGINT", shutdown);
Deno.serve({ onListen, signal: ac.signal }, handleRequest);
