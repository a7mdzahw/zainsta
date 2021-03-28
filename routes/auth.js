const express = require("express");
const router = express.Router();
const { compare } = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/User");
const Joi = require("joi");

// login
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("INVALID EMAIL, NO SUCH USER");

  const { password } = req.body;
  const truePassword = await compare(password, user.password);

  if (!truePassword) return res.status(400).send("INVALID PASSWORD");

  const token = jwt.sign({ id: user._id }, process.env.JWTSECRET);
  res.status(201).send(token);
});

const validate = (user) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(4),
  });
  return schema.validate(user);
};

module.exports = router;
