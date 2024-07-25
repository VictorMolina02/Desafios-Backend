import { Router } from "express";
import { UserController } from "../controller/userController.js";
import { auth } from "../middlewares/auth.js";
export const router = Router();

router.get(
  "/premium/:uid",
  auth(["admin", "user", "premium"]),
  UserController.roleChange
);
