const express = require("express");
const profileRouter = express.Router();
const { Userauth } = require("../middlewares/auth");
const {
  validateProfileData,
  validatePasswordData,
} = require("../utils/validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");

//Profile Section
profileRouter.get("/profile", Userauth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.send("The error is " + err.message);
  }
});

profileRouter.patch("/profile/edit", Userauth, async (req, res) => {
  try {
    if (!validateProfileData(req)) {
      throw new Error("Invalid Edit Request !");
    }

    const loggined = req.user;
    Object.keys(req.body).forEach((key) => (loggined[key] = req.body[key]));
    res.json({
      message: `${loggined.FirstName} Edit Was Successful !!`,
      data: loggined,
    });

    await loggined.save();
  } catch (err) {
    res.send("the error message -" + err);
  }
});

profileRouter.patch("/profile/forgetPassword", Userauth, async (req, res) => {
  try {
    //Taking Both Passwords As Inputs
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    // Validating
    if (!validatePasswordData(req)) throw new Error("Invalid Edit Request !");
    const LoginUser = req.user;

    // Finding User For His Password

    const user = await User.findOne({ Email: LoginUser.Email }).select(
      "+Password"
    );
    if (!user) return res.status(404).send("User not found");

    // Comparing The Password

    const IsPasswordValid = await bcrypt.compare(
      currentPassword,
      user.Password
    );

    if (!IsPasswordValid) {
      return res.status(400).send("Invalid Password !!"); // return to stop execution
    }
    if (!newPassword) return res.status(400).send("New password is required");

    // Hashing the Got Password .
    const hashed = await bcrypt.hash(newPassword, 10);
    user.Password = hashed;
    await user.save();
    return res.status(200).send("Password Changed");
  } catch (err) {
    res.send("The error is " + err);
  }
});
module.exports = profileRouter;

// $2b$10$4D8utQnVipTeatdv.hQYa.6Y8Q4Jxiyc6PeWRTa8524ycbvyI0Ibq
// $2b$10$tAGlRbWPFfegvvWg1BELv.ircF/CriG3tGBUkesU7ncJw7HUaubpy