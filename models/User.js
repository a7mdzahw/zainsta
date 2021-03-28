const mongoose = require("mongoose");
const joi = require("joi");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: mongoose.SchemaTypes.ObjectId, default: "" },
  password: { type: String, required: true, minLength: 4 },
});

const User = mongoose.model("User", userSchema);

const validate = (user) => {
  const schema = joi.object({
    name: joi.string().required().min(3),
    email: joi.string().required().email(),
    avatar: joi.string(),
    password: joi.string().required().min(4),
  });
  return schema.validate(user);
};

module.exports = {
  User,
  validate,
};
