//@ts-check

import { generateId } from "./id.js";
import { Subscriber } from "./subscriber.js";
import { log } from "./log.js";
import { rpc } from "./rpc.js";

const storedId = localStorage.getItem("id");
const id = storedId ?? generateId();
if (storedId !== id) {
  localStorage.setItem("id", id);
}

log("INFO", "Client id", { id });

const ac = new AbortController();
const protocol = location.protocol === "https:" ? "wss:" : "ws:";
const url = `${protocol}//${location.host}/${id}`;
const subscriber = new Subscriber(url, { signal: ac.signal });

subscriber.addEventListener(
  "message",
  (/** @type {CustomEventInit<any>} */ event) => {
    log("INFO", "Subscriber message event received", event.detail);
  }
);

subscriber.addEventListener(
  "isConnected",
  async (/** @type {CustomEventInit<boolean>} */ event) => {
    log("INFO", "Subscriber connection event", { isConnected: event.detail });

    const [err, data] = await rpc("publish", { asd: 123 });
    if (err !== null) {
      log("ERROR", `Error from rpc("publish")`, { error: err });
    }

    log("INFO", `Data from rpc('publish')`, { data });
  }
);
