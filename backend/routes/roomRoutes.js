const express = require("express");
const router = express.Router();
const { createRoom, getRoomById } = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createRoom);
router.get("/:roomId", protect, getRoomById);

module.exports = router;
