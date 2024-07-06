//@ts-check

/**
 * @returns {string}
 */
export function generateId() {
  const cs = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bs = new Uint8Array(16);
  crypto.getRandomValues(bs);

  let id = "";
  for (const b of bs) {
    const randomIndex = b % cs.length;
    id += cs[randomIndex];
  }

  return id;
}
