import { type Request, type Response } from "express";
import User from "../models/user";
import { logActivity } from "../utils/activitieslog";
import { generateToken } from "../utils/generateToken";
import { AuthRequest } from "../middlewares/auth";
import { deleteUserByAdmin, getUsersService, loginUser, registerUser, updateUserByAdmin } from "../services/auth.service";


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await registerUser(req.body);

    if ((req as any).user) {
      await logActivity({
        userId: (req as any).user._id,
        action: "Registered User",
        details: `Registered user with email: ${user.email}`,
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      studentClass: user.studentClass,
      teacherSubject: user.teacherSubject,
      message: "User registered successfully",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    generateToken(user.id.toString(), res);

    res.status(200).json(user);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};


/**
 * @desc    Update user (Admin)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await updateUserByAdmin(
      req.params.id as string,
      req.body
    );

    if ((req as any).user) {
      await logActivity({
        userId: (req as any).user._id.toString(),
        action: "Updated User",
        details: `Updated user with email: ${updatedUser.email}`,
      });
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      studentClass: updatedUser.studentClass,
      teacherSubject: updatedUser.teacherSubject,
      message: "User updated successfully",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Get all users (Pagination & Filtering)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await getUsersService(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await deleteUserByAdmin(req.params.id as string);

    if ((req as any).user) {
      await logActivity({
        userId: (req as any).user._id.toString(),
        action: "Deleted User",
        details: `Deleted user with email: ${deletedUser.email}`,
      });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/users/logout
 * @access  Public
 */
export const logoutUser = async (_req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
