var jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();

const Userauth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new Error("Token is not valid");
  }

  const decodedObj = jwt.verify(token, "process.env.JWT_SECRET_KEY");
  const { _id } = decodedObj;
  const user = await User.findById(_id);
  if (!user) {
    throw new Error("User Not Found !!");
  }
  req.user = user; // Sendig the user
  next();
};
console.log("HIi");
module.exports = {
  Userauth,
};
