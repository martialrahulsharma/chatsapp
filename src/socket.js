import { io } from "socket.io-client";

let socket;

const connectSocket = () => {
if (!socket) {
// Initialize socket connection if it doesn’t already exist
socket = io("http://localhost:3000", { transports: ["websocket"] });
}else if (!socket.connected) {
// If socket exists but is disconnected, reconnect it
socket.connect();
}

// Optional: Set up a listener to confirm reconnection
socket.on("connect", () => {
console.log("Socket connected:", socket.id);
});

return socket;
};

const disconnectSocket = () => {
if (socket) {
socket.disconnect();
console.log("Socket disconnected");
}
};

export { connectSocket, disconnectSocket };