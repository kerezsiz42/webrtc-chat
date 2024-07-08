//@ts-check

import { CONTENT_TYPE_HEADER, CONTENT_TYPE_JSON } from "./contentType.js";

/**
 * @param {string} procedure
 * @param {any} [params]
 * @returns {Promise<[Error, null] | [null, any]>}
 */
export async function rpc(procedure, params) {
  const r = await fetch(`/${procedure}`, {
    method: "POST",
    headers: {
      [CONTENT_TYPE_HEADER]: CONTENT_TYPE_JSON,
    },
    body: JSON.stringify(params),
  });

  if (!r.ok) {
    const err = await r.text();
    return [Error(`fetch response: ${err}`), null];
  }

  const data = await r.json();
  return [null, data];
}
