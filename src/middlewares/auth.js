var jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();

const Userauth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decodedObj = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Sending the user
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

// console.log("HIi");
module.exports = {
  Userauth,
};
