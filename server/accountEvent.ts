import { Evt, to } from "https://deno.land/x/evt@v1.10.2/mod.ts";

import { accounts } from "./accounts.ts";

export const accountEvent = new Evt<["login", string] | ["logout", string]>();

accountEvent.$attach(to("login"), (uuid) => {
  accounts.add(uuid);
  console.log("Current users:", accounts);
});

accountEvent.$attach(to("logout"), (uuid) => {
  accounts.delete(uuid);
  console.log("Current users:", accounts);
});
