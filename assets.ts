import { log } from "./log.js";

const indexHTML = await Deno.readTextFile("index.html");
const scriptJS = await Deno.readTextFile("script.js");
const logJS = await Deno.readTextFile("log.js");
const subscriberJS = await Deno.readTextFile("subscriber.js");
const idJS = await Deno.readTextFile("id.js");
const rpcJS = await Deno.readTextFile("rpc.js");
const stylesCSS = await Deno.readTextFile("styles.css");

export function contentByFilename(
  filename: string
): [null, string] | [Error, null] {
  switch (filename) {
    case "index.html":
      return [null, indexHTML];
    case "script.js":
      return [null, scriptJS];
    case "log.js":
      return [null, logJS];
    case "subscriber.js":
      return [null, subscriberJS];
    case "id.js":
      return [null, idJS];
    case "rpc.js":
      return [null, rpcJS];
    case "styles.css":
      return [null, stylesCSS];
    default:
      return [Error(`file with filename ${filename} not found`), null];
  }
}

export const CONTENT_TYPE_JSON = "application/json; charset=utf-8",
  CONTENT_TYPE_HTML = "text/html; charset=utf-8",
  CONTENT_TYPE_CSS = "text/css; charset=utf-8",
  CONTENT_TYPE_JS = "text/javascript; charset=utf-8",
  CONTENT_TYPE_PLAIN = "text/plan; charset=utf-8";

export function extensionToContentType(
  extension: string
): [null, string] | [Error, null] {
  switch (extension) {
    case "js":
      return [null, CONTENT_TYPE_JS];
    case "css":
      return [null, CONTENT_TYPE_CSS];
    case "html":
      return [null, CONTENT_TYPE_HTML];
    case "json":
      return [null, CONTENT_TYPE_JSON];
    default:
      return [Error(`no content type found for extension ${extension}`), null];
  }
}

export function serveStaticAsset(r: Request): Response {
  const url = new URL(r.url);
  const filename = url.pathname.split("/").at(-1) || "index.html";

  const [err, content] = contentByFilename(filename);
  if (err !== null) {
    log("ERROR", "Error while getting content of a file", {
      error: err.message,
    });
    return new Response("Not found", {
      headers: { "Content-Type": CONTENT_TYPE_PLAIN },
      status: 404,
    });
  }

  const extension = filename.split(".").at(-1) || "";

  const [err1, contentType] = extensionToContentType(extension);
  if (err1 !== null) {
    log("ERROR", "Error while getting extension of file", {
      error: err1.message,
    });
    return new Response("Not found", {
      headers: { "Content-Type": CONTENT_TYPE_PLAIN },
      status: 404,
    });
  }

  log("DEBUG", "Serving static asset", { filename, contentType });
  return new Response(content, {
    headers: { "Content-Type": contentType },
  });
}
