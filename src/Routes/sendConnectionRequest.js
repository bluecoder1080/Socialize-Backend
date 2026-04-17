const express = require("express");
const sendConnectionRequestRouter = express.Router();
const { Userauth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

sendConnectionRequestRouter.post(
  "/request/send/:status/:toUserId",
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
          message: `Connection Request with ${toUser.FirstName } Allready Exists`,
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


module.exports = sendConnectionRequestRouter;
