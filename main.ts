async function handler(): Promise<Response> {
  const text = await Deno.readTextFile("./index.html");
  return new Response(text, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

Deno.serve(handler);
