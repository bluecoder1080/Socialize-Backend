const express = require("express");
const sendConnectionRequestRouter = express.Router();
const { Userauth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const connectionRequest = require("../models/connectionRequest");

sendConnectionRequestRouter.post(
  "/requests/:toUserId/send/:status",
  //  "/requests/:requestId/review/:status",
  Userauth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const statusValidation = ["ignored", "interested"];
      if (!statusValidation.includes(status)) {
        res.status(400).json({
          message: "Invalid Status:  " + status,
        });
      }

      const toUser = await User.findById(toUserId).select("_id FirstName");
      if (!toUser) {
        res.status(404).json({
          message: "User Not Found ",
        });
      }
      // console.log(toUser.FirstName);
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId }, // A → B
          { fromUserId: toUserId, toUserId: fromUserId }, // B → A
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).send({
          message: `Connection Request To ${toUser.FirstName} Already Sent`,
        });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      res.json({
        message: `${toUser.FirstName} has been sucessfully marked ${status}`,
      });
    } catch (err) {
      res.send("the error message -" + err);
    }
  },
);

sendConnectionRequestRouter.post(
  "/requests/:requestId/review/:status",
  Userauth,
  async (req, res) => {
    try {
      const allowedStatuses = ["accepted", "rejected"];
      const loggedInedUser = req.user; // Figure Out This .

      const { status, requestId } = req.params;
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Use 'accepted' or 'rejected'.",
        });
      }
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInedUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res.status(404).json({
          message: "Connection request not found or invalid.",
        });
      }
      connectionRequest.status = status;
      const updatedRequest = await connectionRequest.save();
      return res.status(200).json({
        message: `Request ${status} successfully .`,
        data: updatedRequest,
      });
    } catch (err) {
      return res.status(500).json({
        message: `The Error is ${err.message}`,
      });
    }
  },

  // fromUserId => toUserId
  // both should be present in the db
  // allowedRequest should be valid .
  // Then Modify the data .
);
module.exports = sendConnectionRequestRouter;
