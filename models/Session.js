const mongoose = require("mongoose");

const SessionStorage = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  expires: {
    type: Date,
  },
  lastPage: {
    type: String,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Session = mongoose.model("sessionStorage", SessionStorage);
