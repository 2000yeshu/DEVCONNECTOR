const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

//@route GET api/profile/me
//@desc Test route
//@access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    res.json(profile);
    if (!profile) {
      res
        .status(400)
        .json({ errors: [{ msg: "There is no profile for this user" }] });
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

//@route Post api/profile
//@desc Create or updae profile
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required!").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //Build profile object
    profileFields = {};
    profileFields.user = req.user;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((abc) => abc.trim());
    }

    //Build profile social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let user = await User.findById(req.user);
      if (!user) {
        return res.json("No such user exist!");
      }
      let profile = await Profile.findOne({ user: req.user });
      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route Get api/profile
//@desc Get all proiles
//@access Public
router.get("/", async (req, res) => {
  try {
    let profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error!");
  }
});

module.exports = router;
