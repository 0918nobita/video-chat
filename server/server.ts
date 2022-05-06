import { serve, Handler } from "https://deno.land/std@0.136.0/http/mod.ts";
import { Evt, to } from "https://deno.land/x/evt@v1.10.2/mod.ts";

const users = new Set<string>();

const evt = new Evt<["login", string] | ["logout", string]>();

evt.$attach(to("login"), (uuid) => {
  users.add(uuid);
});

evt.$attach(to("logout"), (uuid) => {
  users.delete(uuid);
});

const reqHandler: Handler = (req) => {
  const ctx = Evt.newCtx();

  const myUUID = crypto.randomUUID();

  if (req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }

  const { socket: ws, response } = Deno.upgradeWebSocket(req);

  ws.addEventListener("open", () => {
    console.log("Connected to client");
    evt.post(["login", myUUID]);
    ws.send(JSON.stringify({ type: "identity", uuid: myUUID }));
    console.log("Current users:", users);
  });

  ws.addEventListener("message", (event) => {
    console.log("Message from client:", event.data);
  });

  ws.addEventListener("close", () => {
    console.log("Disconnected from client");
    ctx.done();
    evt.post(["logout", myUUID]);
    console.log("Current users:", users);
  });

  ws.addEventListener("error", (e) => {
    console.error(e instanceof ErrorEvent ? e.message : e.type);
  });

  evt.$attach(to("login"), ctx, (uuid) => {
    if (uuid === myUUID) return;
    ws.send(JSON.stringify({ type: "login", uuid }));
  });

  evt.$attach(to("logout"), ctx, (uuid) => {
    ws.send(JSON.stringify({ type: "logout", uuid }));
  });

  return response;
};

console.log("Waiting for client ...");
serve(reqHandler, { port: 8080 });
