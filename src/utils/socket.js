const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    // Handle Events

    socket.on("joinChat", ({ userId, targetUserId }) => {
      // create a room
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        //   save message in DB
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          //   check if userId, targetUserId are friends
          const connectionStatus = await ConnectionRequest.find({
            $or: [
              {
                fromUserId: userId,
                toUserId: targetUserId,
                status: "accepted",
              },
              {
                fromUserId: targetUserId,
                toUserId: userId,
                status: "accepted",
              },
            ],
          });

          if (connectionStatus.length === 0) {
            // User is not a friend
            return socket.emit("error", {
              message: "Can't send message to someone who is not your friend",
            });
          }

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = await new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", { firstName, lastName, text });
        } catch (error) {
          console.log(error);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
