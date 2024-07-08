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
  (/** @type {CustomEventInit<string>} */ event) => {
    log("INFO", "Subscriber message event received", { payload: event.detail });
  }
);

subscriber.addEventListener(
  "isConnected",
  async (/** @type {CustomEventInit<boolean>} */ event) => {
    log("INFO", "Subscriber connection event", { isConnected: event.detail });

    const [err, _] = await rpc("publish", {
      id,
      payload: JSON.stringify("hello"),
    });
    if (err !== null) {
      log("ERROR", "rpc('publish') failed", { error: err.message });
      return;
    }

    log("INFO", "rpc('publish') success");
  }
);

const callDialog = /** @type {HTMLDialogElement} */ (
  document.getElementById("call-dialog")
);

const callButton = /** @type {HTMLInputElement} */ (
  document.getElementById("call-button")
);

callButton.addEventListener("click", () => callDialog.showModal());

async function _go() {
  /** @type {RTCConfiguration} */
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun.l.google.com:5349" },
      { urls: "stun:stun1.l.google.com:3478" },
      { urls: "stun:stun1.l.google.com:5349" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:5349" },
      { urls: "stun:stun3.l.google.com:3478" },
      { urls: "stun:stun3.l.google.com:5349" },
      { urls: "stun:stun4.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:5349" },
    ],
    iceCandidatePoolSize: 10,
  };

  const pc = new RTCPeerConnection(rtcConfig);
  let localStream = null;
  let remoteStrem = null;

  const sessionDescription = await pc.createOffer();
  await pc.setLocalDescription(sessionDescription);
}
