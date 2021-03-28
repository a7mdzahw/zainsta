const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("CONNECTED TO DB");
  } catch (ex) {
    console.log("ERROR CONNECTING TO DB", ex.message);
  }
};
