const express = require("express");
const Authrouter = express.Router();
const User = require("../models/user");
const { validateSignupData } = require("../utils/validator");
const bcrypt = require("bcrypt");
var cookieParser = require("cookie-parser");
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
// const { Userauth } = require("../middlewares/auth");
dotenv.config();

Authrouter.use(express.json());
Authrouter.use(cookieParser());

Authrouter.post("/signup", async (req, res) => {
  try {
    // Validate The User .
    validateSignupData(req);

    // Getting The Contents from User !
    const { FirstName, LastName, Email, Password } = req.body;

    //  3. Check if user with same email already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res
        .status(400)
        .send("A user with this email already exists! Please log in instead.");
    }

    // Encrypting The Password.
    const PasswordHash = await bcrypt.hash(Password, 10);

    // Creating New Instance of User .
    const user = new User({
      FirstName,
      LastName,
      Email,
      Password: PasswordHash,
    });

    await user.save();
    res.send("User Added Successfully !!!");
  } catch (err) {
    res.status(400).send("Error While Saving the user" + err.message);
  }
});

Authrouter.post("/signin", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const user = await User.findOne({ Email }).select("+Password");

    if (!user) {
      throw new Error("Invalid Credentials !");
    }

    const IsPasswordValid = await bcrypt.compare(Password, user.Password);

    if (IsPasswordValid) {
      // Token in form of cookie !

      var token = jwt.sign({ _id: user._id }, "process.env.JWT_SECRET_KEY", {
        expiresIn: "7d",
      });

      res.cookie("token", token);
      res.send("Login Successfull ! ");
    } else {
      throw new Error("Invalid Credentials !");
    }
  } catch (err) {
    res.status(400).send("The Error is " + err);
  }
});

module.exports = Authrouter;
