import passport from "passport";
import local from "passport-local";
import github from "passport-github2";
import { UserManager } from "../dao/UserManagerDB.js";
import { createHash, validatePassword } from "../utils.js";
import CartManager from "../dao/CartManagerDB.js";
const userManager = new UserManager();
const cartManager = new CartManager();

export const initPassport = () => {
  passport.use(
    "register",
    new local.Strategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          let { first_name, last_name, age } = req.body;
          if (!first_name || !last_name || !age) {
            return done(null, false);
          }
          let exist = await userManager.getUserBy({ email: username });
          if (exist) {
            return done(null, false);
          }
          let newCart = await cartManager.createCart();
          let newUser = await userManager.createUser({
            first_name,
            last_name,
            email: username,
            age: Number(age),
            password: createHash(password),
            cart: newCart._id,
          });
          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new local.Strategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          let user = await userManager.getUserBy({ email: username });
          if (!user) {
            return done(null, false);
          }
          if (
            username == "adminCoder@coder.com" &&
            password == "adminCod3r123"
          ) {
            user = { first_name: "admin", email: username, role: "admin" };
          }
          if (!validatePassword(password, user)) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new github.Strategy(
      {
        clientID: "Iv23lij05XSe9H8L1IEO",
        clientSecret: "74f5a09f80a5c96b3ce9bc7992bc85fb83d82783",
        callbackURL: "http://localhost:8081/api/sessions/githubCallback",
      },
      async (tokenAcceso, tokenRefresh, profile, done) => {
        try {
          let email = profile._json.email;
          let name = profile._json.name;
          if (!name || !email) {
            return done(null, false);
          }
          let user = await userManager.getUserBy({ email });
          if (!user) {
            let first_name = name.split(" ")[0];
            let last_name = name.split(" ")[1];
            let newCart = await cartManager.createCart();
            user = await userManager.createUser({
              first_name,
              last_name,
              email,
              cart: newCart._id,
              profile,
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    return done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user = await userManager.getUserBy({ _id: id });
    return done(null, user);
  });
};
