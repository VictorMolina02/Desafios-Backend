import { Router } from "express";
import { UserController } from "../controller/userController.js";
import { auth } from "../middlewares/auth.js";
import { upload } from "../utils/index.js";
export const router = Router();

router.get(
  "/premium/:uid",
  auth(["admin", "user", "premium"]),
  UserController.roleChange
);

router.post(
  "/:uid/documents",
  auth(["admin", "user", "premium"]),
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "product", maxCount: 20 },
    { name: "document", maxCount: 1 },
  ]),
  UserController.uploadDocuments
);
