const express = require("express");
const profileRouter = express.Router();
const { Userauth } = require("../middlewares/auth");

//Profile Section
profileRouter.get("/profile", Userauth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.send("The error is " + err.message);
  }
});

profileRouter.patch()
module.exports = profileRouter;
