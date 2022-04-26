export const signaling = () => {
  const ws = new WebSocket("ws://localhost:8080");
  ws.addEventListener("open", () => {
    ws.send("Hello from client");
  });
  ws.addEventListener("message", (event) => {
    console.log("Message from server:", JSON.parse(event.data));
  });
};
