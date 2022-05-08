import { accounts } from "./accounts.ts";

export const getAccounts = (): Response => {
  const body = JSON.stringify([...accounts], null, 2);
  const headers = { "Content-Type": "application/json" };
  return new Response(body, { headers });
};
