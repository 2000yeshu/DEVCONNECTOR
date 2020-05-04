const express = require("express");
const router = express.Router();
const request = require("request");
const config = require("config");
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
//@desc Create or update profile
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

//@route Get api/profile/user/:user_id
//@desc Get proile by user ID
//@access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    let profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user!" });
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    console.log(error.name);

    if (error.name == "CastError") {
      return res
        .status(400)
        .json({ msg: "There is no profile for this user!" });
    }
    res.status(500).send("Server Error!");
  }
});

//@route Delete api/profile
//@desc Delete profile, user, & posts
//@access Private
router.delete("/", auth, async (req, res) => {
  try {
    //@todo delete posts
    //delete profile
    let profiles = await Profile.deleteOne({ user: req.user });

    //delete user
    let user = await User.deleteOne({ _id: req.user });
    res.json({ msg: "User deleted!" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error!");
  }
});

//@route Put api/profile/experience
//@desc Add experience
//@access Private
router.put("/experience", [
  auth,
  [
    check("title", "Title is required!").not().isEmpty(),
    check("company", "Company is required!").not().isEmpty(),
    check("from", "From is required!").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error!");
    }
  },
]);

//@route Delete api/profile/experience/:experience_id
//@desc Delete experience
//@access Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user });

    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error!");
  }
});

//@route Put api/profile/education
//@desc Add education
//@access Private
router.put("/education", [
  auth,
  [
    check("school", "school is required!").not().isEmpty(),
    check("degree", "degree is required!").not().isEmpty(),
    check("fieldofstudy", "fieldofstudy is required!").not().isEmpty(),
    check("from", "from is required!").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error!");
    }
  },
]);

//@route Delete api/profile/education/:education_id
//@desc Delete experience
//@access Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user });

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error!");
  }
});

//@route Get api/profile/github/:username
//@desc Get user repos from Github
//@access Public
router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      //Using OAuth is deprecated
      /*uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,*/

      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`,

      method: "GET",
      headers: { "User-agent": "node-js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode != 200) {
        return res.status(404).json({ msg: "No github profile found!" });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
