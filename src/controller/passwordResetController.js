import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usersModel } from "../dao/models/userModel.js";
import { config } from "../config/config.js";
import { createHash, validatePassword } from "../utils/hashPassword.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: "587",
  auth: {
    user: config.USER_GMAIL_NODEMAILER,
    pass: config.PASSWORD_GMAIL_NODEMAILER,
  },
});
const JWT_SECRET = config.SECRET;

export const requestPasswordReset = (req, res) => {
  res.render("requestPasswordReset");
};

export const sendPasswordResetEmail = async (req, res) => {
  const email = req.body.email;

  try {
    const user = await usersModel.findOne({ email: email });
    if (!user) {
      return res.status(400).send("No user with that email");
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const mailOptions = {
      to: user.email,
      from: "passwordreset@demo.com",
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
        Please click on the following link, or paste this into your browser to complete the process:
        http://${req.headers.host}/reset/${token}
        If you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .send(
        "An email has been sent to " +
          user.email +
          " with further instructions."
      );
  } catch (err) {
    res.status(500).send("Error sending email: " + err.message);
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
      return res.status(400).send("User not found");
    }
    if (!newPassword || !user.password) {
      return res.status(400).send("Password fields cannot be empty");
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
    res.status(500).send("Error updating password: " + err.message);
  }
};
