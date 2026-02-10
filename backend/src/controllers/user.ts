import { type Request, type Response } from "express";
import User from "../models/user";
import { logActivity } from "../utils/activitieslog";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {

        const {name,email,password,role,studentClass,teacherSubject,isActive,} = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role,
            studentClass,
            teacherSubject,
            isActive,
        });

        if (newUser) {
            if ((req as any).user) {
                await logActivity({
                userId: (req as any).user._id,
                action: "Registered User",
                details: `Registered user with email: ${newUser.email}`,
                });
            }
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive,
                studentClass: newUser.studentClass,
                teacherSubject: newUser.teacherSubject,
                message: "User registered successfully",
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}

export const login = async (req:Request,res:Response):Promise<void> => {
    try {
        const {email , password} = req.body;
        const user = await User.findOne({email})

        if (user && (await user.matchPassword(password))) {
            generateToken(user.id.toString(), res);
            res.json(user);
        }else {
            res.status(401).json({ message: "Invalid email or password" });
        }

    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}