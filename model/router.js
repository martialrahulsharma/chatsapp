import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { Server } from "socket.io";
import { createServer } from "http";
import verifyToken from "../middleware/authMiddleware.js";
import { SignupModel } from "./signupSchema.js";
import { ProfileSchema } from "./profileSchema.js";
import { AddedFriendListModel } from "./addedFriendListSchema.js";
import { ChatRoomModel } from "./getChatsSchema.js";
import { notificationSchemaModel } from "./notificationSchema.js";
import { error } from "console";

const router = express.Router();
dotenv.config();

const jwtKey = process.env.JWT_SECRET_KEY;

// configure the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// otp store in database
const otpStore = {};
const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

// send OTP via email
router.post("/sendotp", async (req, res) => {
  const {email} = req.body;
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + OTP_EXPIRATION_TIME };
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };
    await transporter.sendMail(mailOptions).then(data=>{
      console.log(data);
      res.status(200).json(data, {status: "success", message: "Please check your Email"});
    }).catch(error=>{
      console.log(error);
      res.status(500).json({ message: "Error sending OTP", error });
    })
  } catch (error) {
    console.log(error);
    
  }
});

// Verify OTP
const verifyOTP = (email, userOtp) => {
  if (!otpStore[email]) return { success: false, message: "OTP expired or invalid." };

  const { otp, expiresAt } = otpStore[email];

  if (Date.now() > expiresAt) {
      delete otpStore[email];
      return { success: false, message: "OTP expired." };
  }

  if (userOtp === otp) {
      delete otpStore[email];
      return { success: true, message: "OTP verified successfully!" };
  }

  return { success: false, message: "Invalid OTP." };
};
// Route to verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  const response = verifyOTP(email, otp);
  res.status(response.success ? 200 : 400).json(response);
});

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

    if (existingUser == null) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const token = jwt.sign(
      {
        username: existingUser.username,
        userId: existingUser._id,
        name: existingUser.name,
      },
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
    const { username, user } = req.body;
    const friendList = await SignupModel.find({
      $or: [
        { username: { $regex: username, $options: "i" } }, // Case-insensitive search
        // Add more fields if necessary
      ],
    });

    if (!friendList) return res.status(401).json({ error: "User not found" });
    const filteredFriend = friendList.map((user, index) => ({
      username: user.username,
      userId: user._id,
    }));
    if (filteredFriend.length !== 0) {
      const userDocs = await AddedFriendListModel.findOne({
        userId: user.userId,
      })
        .select("myFriendList")
        .exec();
      let myFriendList = "";
      if (userDocs == null) {
        myFriendList = [];
      } else {
        myFriendList = userDocs.myFriendList;
      }

      let requestedFriendList = await notificationSchemaModel.findOne({
        username: user.username,
      });
      if (requestedFriendList !== null) {
        requestedFriendList = requestedFriendList.requestedFriendList;
      }

      let usernmeOfNotificationList = await notificationSchemaModel.findOne({
        username: user.username,
        notificationList: {
          $elemMatch: {
            username: { $in: filteredFriend.map((user) => user.username) },
          },
        },
      });
      res
        .status(200)
        .json({
          filteredFriend,
          usernmeOfNotificationList,
          myFriendList,
          requestedFriendList,
        });
    } else res.status(404).json({ error: "Username not found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/getNotification", verifyToken, async (req, res) => {
  try {
    const { username } = req.body;
    const data = await notificationSchemaModel.findOne({
      username: username,
    });
    if (data == null) {
      return res.status(400).json({ error: "No any notifications" });
    }
    if (data.notificationList.length === 0) {
      return res.status(400).json({ error: "No any notifications" });
    }
    return res.json({ data: data.notificationList });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
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
    if (data.myFriendList.length === 0) {
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
      // const __dirname = path.resolve();
      // Process the friendListData to get only required fields
      const requiredFriendData = friendListData.map((friendData) => {
        return {
          name: friendData.name,
          username: friendData.userId.username,
          isLoggedIn: friendData.isLoggedIn,
          // img: path.join(__dirname, "./uploads/"+friendData.img),
          img: friendData.img ? `/uploads/${friendData.img}` : "",
        };
      });

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
