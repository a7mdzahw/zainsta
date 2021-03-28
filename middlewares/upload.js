const multer = require("multer");
const mongoose = require("mongoose");
const GridfsStorage = require("multer-gridfs-storage");

const storage = new GridfsStorage({ db: mongoose.connection });

const upload = multer({
  storage,
});

module.exports = upload;
