const Room = require("../models/Room");

const createRoom = async (req, res) => {
  const { roomName, isPrivate, password } = req.body;
  try {
    const roomId =
      Math.random().toString(36).substring(2, 5) +
      "-" +
      Math.random().toString(36).substring(2, 6) +
      "-" +
      Math.random().toString(36).substring(2, 5);
    const room = await Room.create({
      roomId,
      roomName: roomName || `Room-${roomId}`,
      host: req.user._id,
      isPrivate: isPrivate || false,
      password: password || "",
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate(
      "host",
      "username profilePicture",
    );
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoom, getRoomById };
