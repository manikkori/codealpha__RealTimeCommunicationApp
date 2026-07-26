const socketHandler = (io) => {
  const roomUsers = {};

  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, userId, username }) => {
      socket.join(roomId);
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }
      roomUsers[roomId] = roomUsers[roomId].filter(
        (u) => u.socketId !== socket.id && u.userId !== userId,
      );
      roomUsers[roomId].push({ socketId: socket.id, userId, username });

      io.to(roomId).emit("room-users-update", roomUsers[roomId]);

      socket.to(roomId).emit("user-connected", {
        socketId: socket.id,
        userId,
        username,
      });

      socket.emit(
        "existing-users",
        roomUsers[roomId].filter((u) => u.socketId !== socket.id),
      );
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

    socket.on("disconnect", () => {
      for (const roomId in roomUsers) {
        const initialLen = roomUsers[roomId].length;
        roomUsers[roomId] = roomUsers[roomId].filter(
          (u) => u.socketId !== socket.id,
        );
        if (roomUsers[roomId].length !== initialLen) {
          io.to(roomId).emit("room-users-update", roomUsers[roomId]);
          socket.to(roomId).emit("user-disconnected", socket.id);
        }
      }
    });
  });
};

module.exports = socketHandler;
