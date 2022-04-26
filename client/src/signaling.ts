export const signaling = () => {
  const ws = new WebSocket("ws://localhost:8080");
  ws.addEventListener("open", () => {
    ws.send("Hello from client");
  });
};
