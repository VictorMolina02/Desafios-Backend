import { Router } from "express";
import passport from "passport";
import { passportCall } from "../middlewares/passportCall.js";
export const router = Router();
import { UserViewDTO } from "../dao/dto/UsersDTO.js";
router.get("/error", (req, res) => {
  return res.status(500).json({ error: "Authentication error" });
});

router.post("/register", passportCall("register"), async (req, res) => {
  return res
    .status(201)
    .json({ payload: "Successful registration", newUser: req.user });
});

router.post("/login", passportCall("login"), async (req, res) => {
  let { web } = req.body;
  let user = { ...req.user };
  delete user.password;
  req.session.user = user;

  if (web) {
    res.redirect("/");
  } else {
    return res.json({ payload: "Successfull login" });
  }
});

router.get("/github", passport.authenticate("github", {}), (req, res) => {});
router.get("/githubCallback", passportCall("github"), (req, res) => {
  req.session.user = req.user;
  return res.redirect("/");
});

router.get("/current", (req, res) => {
  let user = req.session.user;
  let UserDTO = new UserViewDTO(user);
  res.json({ user: UserDTO });
});

router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      if (error.code !== 500) {
        req.logger.error(
          JSON.stringify(
            {
              name: error.name,
              message: error.message,
              stack: error.stack,
              code: error.code,
            },
            null,
            5
          )
        );
      } else {
        req.logger.fatal(
          JSON.stringify(
            {
              name: error.name,
              message: error.message,
              stack: error.stack,
              code: error.code,
            },
            null,
            5
          )
        );
      }
      return res.status(500).json({ error: "Unexpected server error" });
    }
  });
  res.json({ payload: "Logout successfull" });
});
