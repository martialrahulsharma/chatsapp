import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import { createServer } from "http";
import verifyToken from "../middleware/authMiddleware.js";
import { SignupModel } from "./signupSchema.js";
import { ProfileSchema } from "./profileSchema.js";
import { AddedFriendListModel } from "./addedFriendListSchema.js";
import { ChatRoomModel } from "./getChatsSchema.js";

const router = express.Router();
dotenv.config();
const jwtKey = process.env.JWT_SECRET_KEY;

router.post("/signup", async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const existingUser = await SignupModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const doc = new SignupModel({
      _id: new mongoose.Types.ObjectId(),
      name,
      username,
      password: hashedPassword,
    });

    const profileDoc = new ProfileSchema({
      name: name,
      userId: doc._id,
      isLoggedIn: false,
    });
    await doc.save();

    await profileDoc.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch {
    res.status(500).json({ error: "Registration failed" });
  }
});

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await SignupModel.findOne({ username });
    if (!existingUser) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const token = jwt.sign(
      { username: existingUser.username, userId: existingUser._id },
      jwtKey,
      { expiresIn: "1d" }
    );
    const data = await ProfileSchema.findOne({
      userId: existingUser._id,
    }).exec();
    data.isLoggedIn = true;
    await data.save();
    res.status(201).json({
      status: "success",
      message: "User Logged In!",
      accessToken: {
        token,
      },
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
};

// const logout = async (req, res) => {
//   console.log(req.body);
//   const {user} = req.body;
//   const data = await ProfileSchema.findOne({
//     userId: user.username,
//   }).exec();
//   if (data) {
//     data.isLoggedIn = false;
//     await data.save();
//   }
// };

router.post("/login", login);
// router.post("/logout", logout);

// uploading image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    let a = req.userId;
    cb(null, a.slice(-4) + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/saveProfile",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name } = req.body;
      const userId = req.userId;
      const userData = await SignupModel.findOne({ _id: userId });
      const data = await ProfileSchema.findOne({ userId: userData._id }).exec();
      const profileImage = !req.file ? data.img : req.file.filename;
      if (userData._id && data) {
        const __dirname = path.resolve();
        const imagePath = path.join(__dirname, "./uploads/" + data.img);
        if (fs.existsSync(imagePath) && req.file) {
          fs.unlinkSync(imagePath); // Delete the old photo
        }
        // console.log(profileImage);
        userData.name = name;
        data.name = name;
        data.userId = userData._id;
        data.img = profileImage;
        await userData.save();
        await data.save();
        return res
          .status(201)
          .json({ message: "Profile updated successfully" });
      }
      const doc = new ProfileSchema({
        name: name,
        userId: userData._id,
        img: profileImage,
      });
      await doc.save();

      res.status(201).json({ message: "Profile saved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Profile could not save" });
    }
  }
);

// Access profile data
router.get("/getProfileImage", verifyToken, async (req, res) => {
  try {
    const data = await ProfileSchema.findOne({ userId: req.userId });
    if (!data) {
      return res.status(404).json({ error: "Image data not found" });
    }
    const __dirname = path.resolve();
    const imagePath = path.join(__dirname, "./uploads/" + data.img);

    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image file not found" });
    }
    // res.json({imagePath});
    res.sendFile(imagePath, { name: data.name });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getProfileData", verifyToken, async (req, res) => {
  try {
    const data = await SignupModel.findOne({ _id: req.userId });
    if (!data) {
      return res.status(404).json({ error: "Profile data not found" });
    }
    res.send(data);
  } catch (error) {
    console.log(error);
  }
});

router.post("/findFriend", verifyToken, async (req, res) => {
  try {
    const { username } = req.body;
    const friendList = await SignupModel.find({
      $or: [
        { username: { $regex: username, $options: "i" } }, // Case-insensitive search
        // Add more fields if necessary
      ],
    });

    if (!friendList) return res.status(401).json({ error: "User not found" });
    const filteredFriend = friendList.map((user, index) => user.username);
    if (filteredFriend.length !== 0) res.status(200).json(filteredFriend);
    else res.status(404).json({ error: "Username not found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/addFriendInList", verifyToken, async (req, res) => {
  const { usernameOfFriend } = req.body;
  try {
    const friendListData = await SignupModel.findOne({
      username: usernameOfFriend,
    });
    if (!friendListData) {
      return res.status(404).json({ error: "username not found" });
    }
    const addedFriendData = await AddedFriendListModel.findOne({
      userId: req.userId,
    });
    if (addedFriendData == null) {
      const data = new AddedFriendListModel({
        userId: req.userId,
      });
      data.myFriendList.push(friendListData._id);
      await data.save();
      return res.status(200).json({ message: "Friend added successfully" });
    }
    if (addedFriendData.myFriendList.includes(friendListData._id)) {
      return res.status(404).json({ error: "Friend allready exist" });
    }
    addedFriendData.myFriendList.push(friendListData._id);
    await addedFriendData.save();
    return res.status(400).json({ message: "Friend added successfully" });
  } catch (error) {
    res.send().json({ error: "Something went wrong, please visit developer" });
  }
});

router.get("/myfriends", verifyToken, async (req, res) => {
  try {
    const data = await AddedFriendListModel.findOne({
      userId: req.userId,
    }).populate("myFriendList");
    // const profileData = await ProfileSchema.findOne({ userId: req.userId }).populate("userId");
    // console.log(profileData);
    // const profileData = await
    if (!data) {
      return res.status(400).json({ error: "No friends found" });
    }

    async function getFriendListData(data) {
      // Fetch profile data for all friends
      const friendListData = await Promise.all(
        data.myFriendList.map(async (user) => {
          const profileData = await ProfileSchema.findOne({
            userId: user._id,
          }).populate("userId");
          return profileData;
        })
      );

      // Process the friendListData to get only required fields
      const requiredFriendData = friendListData.map((friendData) => {
        return {
          name: friendData.name,
          username: friendData.userId.username,
          isLoggedIn: friendData.isLoggedIn,
        };
      });
      // console.log(requiredFriendData);
      // Return the required friend data
      return requiredFriendData;
    }
    const requiredFriendData = await getFriendListData(data); // Await the resolved data
    res.send(requiredFriendData); // Send the resolved data
  } catch (error) {
    console.log(error);
  }
});

router.post("/getChats", verifyToken, async (req, res) => {
  const { friendUsername } = req.body;
  // console.log(friendUsername);
  const friendUserData = await SignupModel.findOne({
    username: friendUsername,
  });
  try {
    const chatRoomDoc = await ChatRoomModel.findOne({
      communicaterOne: req.userId,
      communicaterOne: friendUserData.userId,
    }).populate("message");
    // if(chatRoomDoc == null){
    //   const doc = new ChatRoomModel({
    //     communicaterOne: req.userId,
    //     communicaterTwo: friendUserData.userId,
    //   })
    // }
    // doc.message.push({});
    // await doc.save();
    if (chatRoomDoc == null) {
      return res.status(400).json({ error: "Welcome, You can start chat" });
    }
    // console.log(chatRoomDoc);
    return res.send(chatRoomDoc);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.post("/addChat", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    // console.log(message);
  } catch (error) {
    console.log(error);
  }
});

export default router;
