const express = require("express");
const { Userauth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();

userRouter.get("/user/requests/received", Userauth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const receivedRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "FirstName LastName Gender photoUrl About");
    return res.status(200).json({
      message: "Data Fetched Successfully !",
      data: receivedRequests,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

userRouter.get("/user/connections", Userauth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "FirstName LastName photoUrl")
      .populate("toUserId", "FirstName LastName photoUrl");

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

// Feed Api
userRouter.get("/feed", Userauth, async (req, res) => {
  try {
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = userRouter;
