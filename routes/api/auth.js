const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/User");

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
        return res.status(400).send("Invalid Credentials");
      }

      //Return jsonwebtoken
      const payload = {
        user: user.id,
      };

      jwt.sign(
        payload,
        config.get("jwtToken"),
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
