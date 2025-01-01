import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
const jwtKey = process.env.JWT_SECRET_KEY;
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access Denied" });
  try {
    const decoded = jwt.verify(
      token,
      jwtKey
    );
    // console.log(req.userId);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export default verifyToken;
