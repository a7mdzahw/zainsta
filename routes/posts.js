const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const { Post, validate, validateComment } = require("../models/Post");
const { User } = require("../models/User");

let bucket;
mongoose.connection.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
});

// get photo by id
router.get("/photo/:id", async (req, res) => {
  const response = bucket.openDownloadStream(mongoose.mongo.ObjectId(req.params.id));
  response.pipe(res);
});

// get posts for user
router.get("/user/:userid", async (req, res) => {
  const posts = await Post.find({ user: req.params.userid }).populate("user", "-password");
  res.send(posts);
});

// get all posts
router.get("/", async (req, res) => {
  const posts = await Post.find({}).populate("user", "-password -email");
  res.status(200).send(posts);
});

// get post by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const validId = mongoose.isValidObjectId(id);
  if (!validId) return res.status(400).send("Invalid ID");

  const post = await Post.findById(id);
  if (!post) return res.status(404).send("NO SUCH POST");

  res.status(200).send(post);
});

// add new post
router.post("/", [auth, upload.single("photo")], async (req, res) => {
  const photo = req.file;
  const { error } = validate(req.body);
  if (error) {
    bucket.delete(photo.id);
    return res.status(400).send(error.details[0].message);
  }
  const { text } = req.body;

  const post = new Post({
    user: req.user.id,
    text,
    photo: photo.id,
  });
  await Post.populate(post, "user");
  post
    .save()
    .then(() => res.status(201).send(post))
    .catch((err) => {
      bucket.delete(photo.id);
      res.status(500).send(err.message);
    });
});

// like post
router.put("/like/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send("NO SUCH POST");

  if (post.likes.includes(req.user.id)) {
    await post.updateOne(
      {
        $pull: { likes: req.user.id },
      },
      { new: true }
    );
  } else {
    await post.updateOne(
      {
        $addToSet: { likes: req.user.id },
      },
      { new: true }
    );
  }
  res.status(200).send(post);
});

// delete post
router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  try {
    if (post.user.toString() !== req.user.id) {
      console.log("herererre");
      return res.status(403).send("NOT AUTHORIZED");
    } else {
      throw new Error();
    }
  } catch (ex) {
    if (!post) return res.status(404).send("NO SUCH POST");
    await bucket.delete(post.photo);
    await post.deleteOne();
    res.status(200).send("SUCCESSFULLY DELETED");
  }
});

// add post comment
router.put("/comment/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send("NO SUCH POST");

  const { error } = validateComment(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user.id);
  const { text } = req.body;

  const comment = {
    user: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
    },
    text,
  };

  post.comments.push(comment);
  await post.save();
  res.status(200).send(post);
});

// delete comment
router.delete("/comment/:postid/:commentid", auth, async (req, res) => {
  let post = await Post.findById(req.params.postid);
  if (!post) return res.status(404).send("NO SUCH POST");

  const comment = post.comments.find((comment) => comment._id.toString() === req.params.commentid);
  if (!comment) return res.status(404).send("NO SUCH COMMENT");

  const isCommentOwner = req.user.id === comment.user._id;
  const isPostOwner = req.user.id === post.user.toString();

  if (isCommentOwner || isPostOwner) {
    post = await Post.findByIdAndUpdate(
      req.params.postid,
      {
        $pull: { comments: comment },
      },
      { new: true }
    );
    res.send(post);
  } else {
    res.status(403).send("not authorized");
  }
});

module.exports = router;
