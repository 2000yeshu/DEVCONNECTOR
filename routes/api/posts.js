const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Posts = require("../../models/Posts");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

//@route POST api/posts
//@desc  Create a post
//@access Private
router.post(
  "/",
  [auth, check("text", "Text is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user);

      const newPost = new Posts({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user,
      });

      await newPost.save();
      res.json(newPost);
    } catch (error) {
      console.log(error.message);

      res.status(500).send("Server Error!");
    }
  }
);

//@route GET api/posts
//@desc  Get all post
//@access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Posts.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.log(error.message);

    res.status(500).send("Server Error!");
  }
});

//@route GET api/posts/:post_id
//@desc  Get a post
//@access Private
router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found!" });
    }
    res.json(post);
  } catch (error) {
    if (error.name == "CastError") {
      return res.status(404).json({ msg: "Post not found!" });
    }
    console.log(error.message);

    res.status(500).send("Server Error!");
  }
});

//@route Delete api/posts/:post_id
//@desc  Delete a post
//@access Private
router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found!" });
    }
    //console.log("Exited!");

    //Check the user
    if (post.user.toString() !== req.user) {
      return res.status(401).json({ msg: "User not Authorized" });
    }

    await post.remove();
    res.json({ msg: "Post removed!" });
  } catch (error) {
    if (error.name == "CastError") {
      return res.status(404).json({ msg: "Post not found!" });
    }
    console.log(error.message);

    res.status(500).send("Server Error!");
  }
});

//@route PUT api/posts
//@desc  Like a post
//@access Private
router.put("/like/:post_id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.post_id);

    //check if the user has already liked the post
    if (
      post.likes.filter((like) => like.user.toString() === req.user).length > 0
    ) {
      return res.status(400).send("Post already liked!");
    }

    post.likes.unshift({ user: req.user });
    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.log(error.message);

    res.status(500).send("Server Error!");
  }
});

//@route Delete api/posts/unlike/:post_id
//@desc  UnLike a post
//@access Private
router.put("/unlike/:post_id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.post_id);

    //check if the user has not liked the post
    if (
      post.likes.filter((like) => like.user.toString() === req.user).length ===
      0
    ) {
      return res.status(400).send("Post not yet liked!");
    }
    const removeIndex = post.likes.map((like) => like.user).indexOf(req.user);
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error!");
  }
});

//@route POST api/posts/comment/:post_id
//@desc  Create a comment
//@access Private
router.post(
  "/comment/:post_id",
  [auth, check("text", "Text is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user);
      const post = await Posts.findById(req.params.post_id);

      if (!post) {
        return res.status(404).json({ msg: "Post not found!" });
      }

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user,
      };

      //res.json(newComment);

      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);

      //await newPost.save();
      //res.json(newPost);
    } catch (error) {
      if (error.name == "CastError") {
        return res.status(404).json({ msg: "Post not found!" });
      }
      console.log(error.message);

      res.status(500).send("Server Error!");
    }
  }
);

//@route Delete api/posts/comment/:post_id/:comment_id
//@desc  Delete a comment
//@access Private
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.post_id);
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //make sure comment exits
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found!" });
    }
    //check user is the user that created it
    if (comment.user.toString() !== req.user) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    const removeIndex = post.comments
      .map((comment) => comment.id)
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json({ msg: "Comment removed!" });
  } catch (error) {
    console.log(error.message);

    res.status(500).send("Server Error!");
  }
});

module.exports = router;
