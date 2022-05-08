import { serve, Handler } from "https://deno.land/std@0.136.0/http/mod.ts";

import { getAccounts } from "./getAccounts.ts";
import { upgradeWS } from "./upgradeWS.ts";

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
