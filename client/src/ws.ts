import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";

import { clientSetStore } from "./store";

const IdentityMessage = t.type({
  type: t.literal("identity"),
  uuid: t.string,
});

const LoginMessage = t.type({
  type: t.literal("login"),
  uuid: t.string,
});

const LogoutMessage = t.type({
  type: t.literal("logout"),
  uuid: t.string,
});

const IncomingCallMessage = t.type({
  type: t.literal("incoming-call"),
  from: t.string,
  offerSDP: t.string,
});

const Message = t.union([
  IdentityMessage,
  LoginMessage,
  LogoutMessage,
  IncomingCallMessage,
]);

type Message = t.TypeOf<typeof Message>;

export const setupWebSocket = (): WebSocket => {
  const ws = new WebSocket("ws://localhost:8080/ws");

  ws.addEventListener("message", (event) => {
    pipe(
      event.data,
      JSON.parse,
      Message.decode,
      E.fold(
        (errors) => {
          console.warn(errors);
        },
        (message) => {
          switch (message.type) {
            case "login":
              clientSetStore.update((state) => {
                state.add(message.uuid);
                return state;
              });
              break;

            case "logout":
              clientSetStore.update((state) => {
                state.delete(message.uuid);
                return state;
              });
              break;
          }
        }
      )
    );
  });

  return ws;
};
