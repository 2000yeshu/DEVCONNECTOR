const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
//@route GET api/auth
//@desc Test route
//@access Pirvate
router.get("/", auth, async (req, res) => {
  try {
    const user = User.findById(req.user).select("-password");
    console.log(req.user);
    res.send(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
