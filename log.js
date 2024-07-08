//@ts-check

/**
 * @param {"INFO" | "ERROR" | "DEBUG" | "WARN"} level
 * @param {string} msg
 * @param {object} [data]
 */
export function log(level, msg, data) {
  const time = new Date().toISOString();
  const line = { time, level, msg, ...data };
  const json = JSON.stringify(line);
  switch (level) {
    case "INFO":
      console.info(json);
      break;
    case "ERROR":
      console.error(json);
      break;
    case "DEBUG":
      console.debug(json);
      break;
    case "WARN":
      console.warn(json);
      break;
  }
}
