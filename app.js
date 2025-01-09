import express, { json } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import router from "../server/model/router.js";
import protectedRouter from "../server/middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import { ChatRoomModel } from "./model/getChatsSchema.js";
import { ProfileSchema } from "./model/profileSchema.js";
import { unreadMessageModel } from "./model/unreadMessageSchema.js";
import { notificationSchemaModel } from "./model/notificationSchema.js";

dotenv.config();
const port = process.env.PORT || 3000;
const dburl =
  "mongodb+srv://martialrahulsharma:lWZjToMnckcbAqMY@chatapp.c1nmqon.mongodb.net/?retryWrites=true&w=majority&appName=chatApp";
const app = express();

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const loginHandler = async (token) => {
    try {
      const decoded = jwt.verify(token, jwtSecretKey);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      console.log(`${socket.username} connected`);
      const data = await ProfileSchema.findOne({
        userId: socket.userId,
      }).exec();
      if (data) {
        data.isLoggedIn = true;
        await data.save().then(() => {
          io.emit("isLoggedIn", {
            name: data.name,
            username: socket.username,
            isLoggedIn: data.isLoggedIn,
          });
        });
      }
    } catch (error) {
      socket.emit("loginError", "Invalid or expired token");
    }
  };

  const logoutHandler = async () => {
    const data = await ProfileSchema.findOne({
      userId: socket.userId,
    }).exec();
    if (data) {
      data.isLoggedIn = false;
      await data.save().then(() => {
        io.emit("isLoggedIn", {
          name: data.name,
          username: socket.username,
          isLoggedIn: data.isLoggedIn,
        });
      });
    }

    // Disconnect the socket
    console.log(`${socket.username} logged out`);
    socket.disconnect();
  };

  const leaveRoomSocketHandler = ({ username, roomId }) => {
    socket.leave(roomId);
    console.log(`${username} left room: ${roomId}`);
  };

  // when user login then join his/her room
  const myRoomSocketHandler = async (username) => {
    console.log(username, "joined room");
    console.log(socket.username);
    socket.join(username);
    // after login unread message will run
    // Fetch unread messages
    try {
      let unreadMessage = await unreadMessageModel.findOne({
        user: username,
      });

      if (unreadMessage !== null) {
        let lengthOfUnreadMessages = unreadMessage.senderMessage.map(
          (msg, index) => {
            return {
              sender: msg.sender,
              message: msg.message.length,
            };
          }
        );
        // Send unread messages to the specific client
        socket.emit("myRoom", lengthOfUnreadMessages);
      }
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  // when user join the room then isRead == true and all messages will send to user
  const joinRoomSocketHandler = async (user1, user2) => {
    console.log(`user1 ${user1} and user2 ${user2}`);
    const roomId = generateRoomId(user1, user2); // Generate a unique room ID
    socket.join(roomId);
    if (roomId) {
      // Function to clear messages for a matched sender

      try {
        // Find and update the document
        const result = await unreadMessageModel.updateOne(
          {
            user: user1,
            "senderMessage.sender": user2,
          },
          {
            $set: { "senderMessage.$.message": [] }, // Clear the message array where sender matches
          }
        );

        // console.log("Update result:", result);
      } catch (error) {
        console.error("Error updating messages:", error);
      }

      let chat = await ChatRoomModel.findOne({ roomId });
      if (chat !== null) {
        await chat.save().then(() => {
          // console.log(chat.message);
          io.to(roomId).emit("receive_message", chat.message);
          io.to(user2).emit("myFriendJoinRoom", `${user1} joining room`);
        });
      }
    }
  };

  const friendMessageIsReadHandler = async (roomId, friendUsername) => {
    await ChatRoomModel.updateMany(
      { roomId, "message.sender": friendUsername }, // Match the roomId and messages where sender is 'Rahul'
      { $set: { "message.$[elem].isRead": true } }, // Update only the isRead field
      { arrayFilters: [{ "elem.sender": friendUsername }] }
    )
      .then((result) =>
        console.log(
          `Updated ${result.modifiedCount} messages sent by ${friendUsername} in room`
        )
      )
      .catch((e) => console.log(e));
    // }
  };

  const sendMessageSocketHandler = async (roomId, message, user2) => {
    const room = io.sockets.adapter.rooms;
    const user2RoomExist = room.has(user2);
    let user2SocketID = "";
    if (user2RoomExist) {
      user2SocketID = room.get(user2);
    }
    const user1SocketID = room.get(roomId);
    const room1Sockets = [...user2SocketID]; // Convert to array for iteration
    const room2Sockets = new Set(user1SocketID); // Set for fast lookup
    const commonRooms = room1Sockets.filter((socketId) =>
      room2Sockets.has(socketId)
    );

    let unreadChat = await unreadMessageModel.findOne({ user: user2 });
    if (unreadChat == null) {
      unreadChat = new unreadMessageModel({ user: user2, message: [] });
    }

    let chat = await ChatRoomModel.findOne({ roomId });
    if (chat == null) {
      // If the room doesn't exist, create a new document
      chat = new ChatRoomModel({ roomId, messages: [] });
    }
    chat.roomId = roomId;
    if (message.message.trim() == "") {
      return;
    }
    chat.message.push({
      sender: message.sender,
      message: message.message.trim(),
      timestamp: new Date(),
      isRead: commonRooms.length > 0 ? true : false,
    });
    await chat
      .save()
      .then(() => {
        // Emit the message to all users in the room
        io.to(roomId).emit("receive_message", chat.message.slice(-1)[0]);
        // const unreadMessage = chat.message.filter((message) => {
        //   return message.isRead == false;
        // });
        // io.to(user2).emit("myRoom", unreadMessage);
      })
      .catch((err) => console.error("Error showing message:", err));

    if (commonRooms.length < 1) {
      let findSender = unreadChat.senderMessage.findIndex(
        (arr, index) => arr.sender == message.sender
      );

      if (findSender !== -1) {
        unreadChat.senderMessage[findSender].sender = message.sender;
        unreadChat.senderMessage[findSender].message.push(message);
        // unreadChat.senderMessage.push()
      } else if (unreadChat !== null) {
        unreadChat.senderMessage.push({
          sender: message.sender,
          message: message,
        });
      }

      await unreadChat.save().then(() => {
        let lengthOfUnreadMessages = unreadChat.senderMessage.map(
          (msg, index) => {
            return {
              sender: msg.sender,
              message: msg.message.length,
            };
          }
        );
        io.to(user2).emit("myRoom", lengthOfUnreadMessages);
      });
    }
  };

  const notificationSocketHandler = async (
    whomeRequesterUsername,
    myUsername
  ) => {
    try {
      let data = await notificationSchemaModel.findOne({
        username: whomeRequesterUsername,
      });
      console.log(data);
      if (data == null) {
        data = new notificationSchemaModel({
          username: whomeRequesterUsername,
          notificationList: [{username: myUsername}],
        });
      } else {
        const usernameExist = data.notificationList.some((entry)=> entry.username === myUsername)
        if(!usernameExist){
          data.notificationList.push({username: myUsername});
        }
      }
      data.save().then(() => {
        io.to(whomeRequesterUsername).emit(
          "emitNotification",
          data.notificationList
        );
      });
    } catch (error) {
      console.log(error);
    }
  };

  socket.off("login", loginHandler);
  socket.off("logout", logoutHandler);
  socket.off("leaveRoom", leaveRoomSocketHandler);
  socket.off("join_room", joinRoomSocketHandler);
  socket.off("friendMessageIsRead", friendMessageIsReadHandler);
  socket.off("send_message", sendMessageSocketHandler);
  socket.off("myRoom", myRoomSocketHandler);
  socket.off("notificationSocketHandler", notificationSocketHandler);
  socket.on("login", loginHandler);
  socket.on("logout", logoutHandler);
  socket.on("leaveRoom", leaveRoomSocketHandler);
  socket.on("join_room", joinRoomSocketHandler);
  socket.on("send_message", sendMessageSocketHandler);
  socket.on("friendMessageIsRead", friendMessageIsReadHandler);
  socket.on("myRoom", myRoomSocketHandler);
  socket.on("notificationSocketHandler", notificationSocketHandler);

  function generateRoomId(user1, user2) {
    // Create a unique room ID based on the user names
    const sortedUsers = [user1, user2].sort();
    return `${sortedUsers[0]}-${sortedUsers[1]}`;
  }

  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
    }
    socket.off("login", loginHandler);
    socket.off("logout", logoutHandler);
    socket.off("leaveRoom", leaveRoomSocketHandler);
    socket.off("join_room", joinRoomSocketHandler);
    socket.off("friendMessageIsRead", friendMessageIsReadHandler);
    socket.off("send_message", sendMessageSocketHandler);
    socket.off("myRoom", myRoomSocketHandler);
    socket.off("notificationSocketHandler", notificationSocketHandler);
  });
});

//json parsing
app.use(bodyParser.json());

//Urlencoded data parsing
app.use(bodyParser.urlencoded({ extended: true }));

//Middleware
app.use(json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Connecting to database
mongoose.connect(dburl);
const conn = mongoose.connection;
conn.once("open", () => {
  console.log("Database connect succesfully");
});
conn.on("error", () => {
  console.log("Error connection to database");
  process.exit();
});

//Router
app.use(router);
app.use("/protected", protectedRouter);

//Start the server
server.listen(port, () => {
  console.log(`Server run on port ${port}`);
});
