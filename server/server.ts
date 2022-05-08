import { serve, Handler } from "https://deno.land/std@0.136.0/http/mod.ts";
import { Evt, to } from "https://deno.land/x/evt@v1.10.2/mod.ts";

const accounts = new Set<string>();

const accountEvent = new Evt<["login", string] | ["logout", string]>();

accountEvent.$attach(to("login"), (uuid) => {
  accounts.add(uuid);
  console.log("Current users:", accounts);
});

accountEvent.$attach(to("logout"), (uuid) => {
  accounts.delete(uuid);
  console.log("Current users:", accounts);
});

const upgradeWS = (req: Request): Response => {
  if (req.headers.get("upgrade") !== "websocket")
    return new Response(null, { status: 501 });

  const ctx = Evt.newCtx();

  const myUUID = crypto.randomUUID();

  const { socket: ws, response } = Deno.upgradeWebSocket(req);

  ws.addEventListener("open", () => {
    accountEvent.post(["login", myUUID]);
    ws.send(JSON.stringify({ type: "identity", uuid: myUUID }));
  });

  ws.addEventListener("message", (event) => {
    console.log("Message from client:", event.data);
  });

  ws.addEventListener("close", () => {
    ctx.done();
    accountEvent.post(["logout", myUUID]);
  });

  ws.addEventListener("error", (e) => {
    console.error(e instanceof ErrorEvent ? e.message : e.type);
  });

  accountEvent.$attach(to("login"), ctx, (uuid) => {
    if (uuid === myUUID) return;
    ws.send(JSON.stringify({ type: "login", uuid }));
  });

  accountEvent.$attach(to("logout"), ctx, (uuid) => {
    ws.send(JSON.stringify({ type: "logout", uuid }));
  });

  return response;
};

const getAccounts = (): Response => {
  const body = JSON.stringify([...accounts], null, 2);
  const headers = { "Content-Type": "application/json" };
  return new Response(body, { headers });
};

const reqHandler: Handler = (req) => {
  const { pathname } = new URL(req.url);

  switch (pathname) {
    case "/ws":
      return upgradeWS(req);
    case "/accounts":
      return getAccounts();
    default:
      return new Response("Not Found", { status: 404 });
  }
};

console.log("Waiting for client ...");
serve(reqHandler, { port: 8080 });
