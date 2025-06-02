import bcrypt from 'bcryptjs';
import { db } from '../libs/db.js';
import { UserRole } from '../generated/prisma/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export const registerController = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
      },
    });

    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        image: newUser.image,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error creating user!",
      error,
      success: false,
    });
  }
};


export const loginController = async(req, res) => {
  const { email, password } = req.body;
  try {
    if(!email || !password){
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      })
    }

    const user = await db.user.findUnique({
      where: {email}
    });
    if(!user){
      return res.status(404).json({
        message: "User doesn't exist!",
        success: false,
      })
    }
    const isMatched = await bcrypt.compare(password, user.password);
    
    if(!isMatched){
      return res.status(401).json({
        message: "Email or password is invalid!",
        success: false,
      })
    }

    const token = jwt.sign({id: user.id},process.env.JWT_SECRET, { expiresIn: "7d"})


    res.cookie("token", token,{
      httpsOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      message: "User loggedIn successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      success: true,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while logging",
      error,
      success: false
    })
  }
}

export const logoutController = async(req, res) => {
  try {
    res.cookie("token", '', {
      httpsOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
  
    res.status(200).json({
      success: true,
      message: "User logout successfully!",
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
      error,
    })
  }
}

export const checkController = async(req, res) => {
  try {
    res.status(200).json({
      message: "User authenticated successfully",
      success: true,
      user: req.user
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error checking user!",
      error,
      success: false
    })
  }
}