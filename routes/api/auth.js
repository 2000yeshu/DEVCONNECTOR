const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/User");
const Session = require("../../models/Session");

//@route GET api/auth
//@desc Test route
//@access Pirvate
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    //console.log(user);
    res.send(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

//@route POST api/auth
//@desc Authenticate user and get token
//@access Public
router.post(
  "/",
  [
    check("email", "Please include a valid email address!").not().isEmpty(),
    check("password", "Please enter a password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      //console.log("Yes");
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      //if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials!" }] });
      }

      //match pass
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials!" }] });
      }

      //session
      const now = new Date();
      const then = now.setTime(now.getTime() + config.get("sessionExpiry"));
      const expiry = new Date(then);
      const sessionStorage = new Session({
        userID: user.id,
        lastPage: "/home",
        expires: expiry,
      });
      sessionStorage.save();

      //Return jsonwebtoken
      const payload = {
        user: user.id,
        sessionID: sessionStorage._id,
      };

      jwt.sign(
        payload,
        config.get("jwtToken"),
        { expiresIn: config.get("sessionExpiry") },
        (err, token) => {
          if (err) throw err;
          const now = new Date();

          res.cookie("DC_ST", token, {
            maxAge: config.get("sessionExpiry"),
            // You can't access these tokens in the client's javascript
            //httpOnly: true,
            // Forces to use https in production
            secure: process.env.NODE_ENV === "production" ? true : false,
          });
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

//@route POST api/auth
//@desc Test route
//@access Pirvate
router.post("/logout", auth, async (req, res) => {
  try {
    console.log("logout api hit", req.sessionID);
    const sessionStorage = await Session.findById(req.sessionID);
    await Session.deleteOne({ _id: sessionStorage });
    res.clearCookie("DC_ST");
    res.send("SUCCESS");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
