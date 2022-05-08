import { Evt, to } from "https://deno.land/x/evt@v1.10.2/mod.ts";
import * as t from "https://esm.sh/io-ts@2.2.16";

import { accountEvent } from "./accountEvent.ts";

const outgoingCallMessage = t.type({
  type: t.literal("outgoing-call"),
  to: t.string,
});

export const upgradeWS = (req: Request): Response => {
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
