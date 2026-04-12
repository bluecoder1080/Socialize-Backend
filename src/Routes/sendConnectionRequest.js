const express = require("express");
const sendConnectionRequestRouter = express.Router();
const { Userauth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

sendConnectionRequestRouter.post(
  "/sendConnectionRequest/:status/:toUserId",
  Userauth,
  async (req, res) => {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const statusValidation = ["ignored", "interested"];
    if (!statusValidation.includes(status)) {
      res.status(400).json({
        message: "Invalid Status:  " + status,
      });
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });
    const data = await connectionRequest.save();
    res.json({
      message: "Connection Request Sent !",
    });
  },
);

module.exports = sendConnectionRequestRouter;
