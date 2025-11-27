const express = require("express");
const profileRouter = express.Router();
const { Userauth } = require("../middlewares/auth");
const { validateProfileData } = require("../utils/validator");

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
    res.send(`${loggined.FirstName} Edit Was Successfull !!`);

    await loggined.save();
  } catch (err) {
    res.send("the error message -" + err);
  }
});
module.exports = profileRouter;
