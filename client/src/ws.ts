import { clientSetStore } from "./store";

export const setupWebSocket = (): void => {
  const ws = new WebSocket("ws://localhost:8080");

  ws.addEventListener("open", () => {
    ws.send("Hello from client");
  });

  ws.addEventListener("message", (event) => {
    const { type, uuid } = JSON.parse(event.data);

    switch (type) {
      case "login":
        clientSetStore.update((state) => {
          state.add(uuid);
          return state;
        });
        break;

      case "logout":
        clientSetStore.update((state) => {
          state.delete(uuid);
          return state;
        });
        break;
    }
  });
};
