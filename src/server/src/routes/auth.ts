import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import { default as db, UserRow } from "../db.js";

export const MODES = {
  Local: "local", // use local resources
  ApiOnly: "api-only", // skip authentication
};

const router = express.Router();

passport.use("local", new LocalStrategy(function verify(username, password, callback) {
  console.log(`🔎 Verifying ${username}`);
  db.query<UserRow>("SELECT * FROM users WHERE username = $1", [ username ], (err, result) => {
    const [row] = result.rows;
    if (err) { return callback(err); }
    if (!row) { return callback(null, false, { message: "Incorrect username or password." }); }

    console.log(`Found ${username}`);

    crypto.pbkdf2(password, row.salt, 310000, 32, "sha256", function(err, hashedPassword) {
      if (err) { return callback(err); }
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return callback(null, false, { message: "Incorrect username or password." });
      }
      console.log(`✅ Verified ${username}`);
      return callback(null, row);
    });
  });
}));

type User = {
  id: string,
  username: string
};

passport.serializeUser(function(user: unknown, callback) {
  process.nextTick(function() {
    callback(null, { id: (user as User).id, username: (user as User).username });
  });
});

passport.deserializeUser(function(user: User, callback) {
  process.nextTick(function() {
    return callback(null, user);
  });
});

router.post("/login/password", passport.authenticate("local", {
  successRedirect: "/app",
  failureRedirect: "/login",
  failureMessage: true
}));

router.post("/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
});

export default router;
