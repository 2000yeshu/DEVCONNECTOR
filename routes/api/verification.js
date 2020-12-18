const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/User");
const firebase = require("firebase");
const SSE = require("express-sse");
var sse = new SSE();

//@route POST  api/verify/sendEmail

router.post("/sendEmail", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email, "at server");
    var actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: config.get("sendEmailRedirectUrl"),
      // This must be true.
      handleCodeInApp: true,
      //   iOS: {
      //     bundleId: "com.example.ios",
      //   },
      //   android: {
      //     packageName: "com.example.android",
      //     installApp: true,
      //     minimumVersion: "12",
      //   },
      //dynamicLinkDomain: "example.page.link",
    };

    firebase
      .auth()
      .sendSignInLinkToEmail(email, actionCodeSettings)
      .then(function () {
        // The link was successfully sent. Inform the user.
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        //window.localStorage.setItem("emailForSignIn", email);
        console.log("email sent");
        const payload = {
          email: email,
        };
        jwt.sign(
          payload,
          config.get("jwtToken"),
          { expiresIn: config.get("sessionExpiry") },
          (err, token) => {
            if (err) throw err;
            const now = new Date();

            res.json(token);
          }
        );
        //res.json(email);
      })
      .catch(function (error) {
        console.log("error email not sent");
        return res
          .status(400)
          .json({ msg: "Something went wrong. Please try again" });
        // Some error occurred, you can inspect the code: error.code
      });
  } catch (error) {
    console.log(error.message);
    return res.status(500).error({ msg: "Server Error." });
  }
});

//@route GET  api/verify
//@desc Verify incoming request
//@access Public
router.post("/", async (req, res) => {
  try {
    console.log("verify email");
    if (firebase.auth().isSignInWithEmailLink(req.headers.referer)) {
      // Additional state parameters can also be passed via URL.
      // This can be used to continue the user's intended action before triggering
      // the sign-in operation.
      // Get the email if available. This should be available if the user completes
      // the flow on the same device where they started it.
      var emailToken = req.body.email;
      const decoded = jwt.decode(emailToken);
      const email = decoded.email;
      console.log(email, "email");

      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again. For example:
        //email = window.prompt("Please provide your email for confirmation");
        console.log("no email");
      }
      // The client SDK will parse the code from the link for you.
      firebase
        .auth()
        .signInWithEmailLink(email, req.headers.referer)
        .then(function (result) {
          // Clear email from storage.
          //window.localStorage.removeItem("emailForSignIn");
          // You can acscess the new user via result.user
          // res.setHeader("Cache-Control", "no-cache");
          // res.setHeader("Content-Type", "text/event-stream");
          // res.setHeader("Access-Control-Allow-Origin", "*");
          // res.flushHeaders(); // flush the headers to establish SSE with client
          sse.send("Email verified", "email verified");
          res.json({ msg: "Email verified successfully" });
          // Additional user info profile not available via:
          // result.additionalUserInfo.profile == null
          // You can check if the user is new or existing:
          // result.additionalUserInfo.isNewUser
        })
        .catch(function (error) {
          console.log("@", error);
          return res.status(400).json({ msg: error });
          // Some error occurred, you can inspect the code: error.code
          // Common errors could be invalid email and invalid or expired OTPs.
        });
    } else return res.status(403).json({ msg: "Not a valid url" });
  } catch (error) {
    console.log(error.message);
    return res.status(400).error({ msg: "Server error" });
    //res.status(500).send("Server Error!");
  }
});

router.get("/stream", sse.init);

module.exports = router;
