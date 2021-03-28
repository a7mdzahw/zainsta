const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers["auth-token"];
  if (!token) return res.status(403).send("NO TOKEN PROVIDED");

  try {
    const user = jwt.verify(token, process.env.JWTSECRET);
    req.user = user;
    next();
  } catch (ex) {
    return res.status(403).send("INVALID TOKEN");
  }
};
