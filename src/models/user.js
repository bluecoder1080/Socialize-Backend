const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  FirstName: String,
  LastName: String,
  Email: String,
  Password: String,
  Gender: String,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
