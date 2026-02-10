import express from "express";
import { register , login } from "../controllers/user";
import { authorize, protect } from "../middlewares/auth";

const userRoutes = express.Router();

userRoutes.post(
  "/register",
  protect,
  authorize(["admin", "teacher"]),
  register
);
userRoutes.post(
  "/login",
  login
);

export default userRoutes;