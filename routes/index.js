const users = require("./users");
const auth = require("./auth");
const posts = require("./posts");

module.exports = (app) => {
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/posts", posts);
};
