import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import { db } from "../libs/db.js";
dotenv.config();

const isAuthenticated = async(req, res, next) => {
  try {
    const token = req.cookies?.token;
  if(!token){
    return res.status(401).json({
      message: "Please login!",
    })
  }

  // console.log("Auth middle token: ", token);
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  // console.log("Decoded value: ", decoded);

  const user = await db.user.findUnique({
    where: {
      id: decoded.id
    },
    select: {
      id: true,
      image: true,
      name: true,
      role: true,
      email: true
    }
  })
  if(!user){
    return res.status(401).json({
      message: "User not found",
    })
  }
  req.user = user;

  // console.log(`Req.user: ${req.user}`)
  next();
  } catch (error) {
    res.status(401).json({
      message: "Please login first!",
      error,
    })
  }
}

const checkAdmin = async(req, res, next) => {
  try{
    console.log("req.user inside checkAdmin", req.user.id, req.user)
    const userId = req.user?.id;
    const user = await db.user.findUnique({
      where: {
        id: userId
      },
      select: {
        role: true
      }
    })
    if(!user || user.role !== "ADMIN"){
      return res.status(403).json({
        message: "Forbidden - You don't have permission to access this resource"
      })
    }
    next();
  }catch (err){
    console.error("Error check teh admin role: ", err);
    return res.status(500).json({
      message: "Error checking the admin role"
    })
  }
}

export {isAuthenticated, checkAdmin} ;