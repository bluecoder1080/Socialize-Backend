const express = require("express")
const sendConnectionRequestRouter = express.Router();
const { Userauth } = require("../middlewares/auth");

sendConnectionRequestRouter.post("/sendConnectionRequest", Userauth, (req, res) => {
  const user = req.user;
  console.log("Sending A connection Request");

  res.send(user.FirstName + " Sent The Connection request !!");
});

module.exports = sendConnectionRequestRouter;