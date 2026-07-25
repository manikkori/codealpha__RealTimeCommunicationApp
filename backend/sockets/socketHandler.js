const socketHandler = (io) => {
  const roomUsers = {};

  io.on("connection", (socket) => {
    // Handle WebRTC peer signaling and room mesh topology
    socket.on("join-room", ({ roomId, userId, username }) => {
      socket.join(roomId);
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }
      roomUsers[roomId].push({ socketId: socket.id, userId, username });

      socket.to(roomId).emit("user-connected", {
        socketId: socket.id,
        userId,
        username,
      });

      socket.emit(
        "existing-users",
        roomUsers[roomId].filter((u) => u.socketId !== socket.id),
      );

      socket.on("disconnect", () => {
        roomUsers[roomId] = roomUsers[roomId]?.filter(
          (u) => u.socketId !== socket.id,
        );
        socket.to(roomId).emit("user-disconnected", socket.id);
      });
    });

    socket.on(
      "webrtc-signal",
      ({ targetSocketId, signal, callerId, username }) => {
        io.to(targetSocketId).emit("webrtc-signal", {
          signal,
          callerId: socket.id,
          userId: callerId,
          username,
        });
      },
    );

    socket.on("send-message", ({ roomId, message, sender, timestamp }) => {
      io.to(roomId).emit("receive-message", { message, sender, timestamp });
    });

    socket.on("whiteboard-draw", ({ roomId, drawData }) => {
      socket.to(roomId).emit("whiteboard-draw", drawData);
    });
  });
};

module.exports = socketHandler;
