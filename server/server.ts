import { serve, Handler } from "https://deno.land/std@0.136.0/http/mod.ts";

const reqHandler: Handler = (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);
  ws.addEventListener("open", () => {
    console.log("Connected to client");
    ws.send(JSON.stringify({ type: "identity", id: crypto.randomUUID() }));
  });
  ws.addEventListener("message", (event) => {
    console.log("Message from client:", event.data);
  });
  ws.addEventListener("close", () => {
    console.log("Disconnected from client");
  });
  ws.addEventListener("error", (e) => {
    console.error(e instanceof ErrorEvent ? e.message : e.type);
  });
  return response;
};

console.log("Waiting for client ...");
serve(reqHandler, { port: 8080 });
