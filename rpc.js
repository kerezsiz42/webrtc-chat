//@ts-check

/**
 * @param {string} procedure
 * @param {any} [params]
 * @returns {Promise<[Error, null] | [null, any]>}
 */
export async function rpc(procedure, params) {
  const r = await fetch(`/${procedure}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!r.ok) {
    const err = await r.text();
    return [Error(`non-OK response received from fetch: ${err}`), null];
  }

  const data = await r.json();
  return [null, data];
}
