const mongoose = require("mongoose");
const joi = require("joi");

const commentSchema = new mongoose.Schema(
  {
    user: {
      _id: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: "User" },
      name: { type: String, required: true },
      avatar: { type: mongoose.SchemaTypes.ObjectId, ref: "file" },
    },
    text: { type: String, required: true },
    likes: [mongoose.SchemaTypes.ObjectId],
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: "User" },
    text: { type: String },
    photo: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: "file" },
    likes: [mongoose.SchemaTypes.ObjectId],
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

const validate = (post) => {
  const schema = joi.object({
    text: joi.string().required(),
    photo: joi.string(),
  });
  return schema.validate(post);
};

const validateComment = (comment) => {
  const schema = joi.object({
    text: joi.string().required(),
  });
  return schema.validate(comment);
};

module.exports = {
  Post,
  validate,
  validateComment,
};
