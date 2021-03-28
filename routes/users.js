const express = require("express");
const router = express.Router();
const { hash } = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User, validate } = require("../models/User");
const auth = require("../middlewares/auth");
const mongoose = require("mongoose");
const upload = require("../middlewares/upload");

let bucket;
mongoose.connection.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
});
// get current profile
router.get("/me", [auth], async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  res.status(200).send(currentUser);
});

// get user avatar
router.get("/avatar/:id", async (req, res) => {
  const avatar = bucket.openDownloadStream(mongoose.mongo.ObjectId(req.params.id));
  avatar.pipe(res);
});

// get user by id
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.status(200).send(user);
});

// add new user
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("USER ALEARDY EXISTS");

  const { name, email, avatar, password } = req.body;
  const hashedPassword = await hash(password, 10);

  user = new User({
    name,
    email,
    avatar,
    password: hashedPassword,
  });

  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWTSECRET);
  res.status(201).send(token);
});

// update profile
router.put("/", [auth, upload.single("avatar")], async (req, res) => {
  // const { error } = validate(req.body);
  // if (error) {
  //   bucket.delete(req.file.id);
  //   return res.status(400).send(error.details[0].message);
  // }
  let oldId = req.body.oldId;

  let { avatar } = req.body;

  if (req.file) {
    avatar = req.file.id;
  }

  // const hashedPassword = await hash(password, 10);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        avatar,
      },
    },
    { new: true }
  );

  if (req.file) await bucket.delete(mongoose.mongo.ObjectId(oldId));

  res.send(user);
});

module.exports = router;
