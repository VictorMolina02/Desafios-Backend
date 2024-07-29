import jwt from "jsonwebtoken";
import { usersModel } from "../dao/models/userModel.js";
import { config } from "../config/config.js";
import { createHash, validatePassword } from "../utils/hashPassword.js";
import { sendResetPassword } from "../utils/mailing.js";
import { CustomError } from "../utils/CustomError.js";
import { ERROR_TYPES } from "../utils/EErrors.js";

const JWT_SECRET = config.SECRET;

export const requestPasswordReset = (req, res) => {
  res.render("requestPasswordReset");
};

export const sendPasswordResetEmail = async (req, res) => {
  const email = req.body.email;

  try {
    const user = await usersModel.findOne({ email: email });
    if (!user) {
      return CustomError.createError(
        "ERROR",
        null,
        "No user with that email",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    sendResetPassword(token, user);
    res
      .status(200)
      .send(
        "An email has been sent to " +
          user.email +
          " with further instructions."
      );
  } catch (err) {
    return CustomError.createError(
      "ERROR",
      null,
      "Error sending email",
      ERROR_TYPES.INTERNAL_SERVER_ERROR
    );
  }
};

export const resetPassword = (req, res) => {
  const token = req.params.token;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/request-password-reset");
    }

    res.render("resetPassword", { token });
  });
};

export const updatePassword = async (req, res) => {
  const token = req.params.token;
  const newPassword = req.body.password;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await usersModel.findOne({ email: decoded.email });
    if (!user) {
      return CustomError.createError(
        "ERROR",
        null,
        "User not found",
        ERROR_TYPES.NOT_FOUND
      );
    }
    if (!newPassword || !user.password) {
      return CustomError.createError(
        "ERROR",
        null,
        "Password fields cannot be empty",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    const isSame = validatePassword(newPassword, user);
    if (isSame) {
      return res
        .status(400)
        .send("New password cannot be the same as the old password");
    }

    const hash = createHash(newPassword);
    user.password = hash;

    await user.save();
    res.status(200).send("Password has been reset.");
  } catch (err) {
    return CustomError.createError(
      "ERROR",
      null,
      `Internal server error`,
      ERROR_TYPES.INTERNAL_SERVER_ERROR
    );
  }
};
