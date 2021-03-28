const express = require("express");
const app = express();

require("dotenv").config();
require("./config/db")();

app.use(express.json());
require("./routes")(app);

const port = process.env.PORT || 8000;
app.listen(port, (err) => {
  if (err) throw new Error(err.message);
  console.log(`Running on http://localhost:${port}`);
});
