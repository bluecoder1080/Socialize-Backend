const express = require("express");
const { Userauth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
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

// Feed API - Returns users to connect with
userRouter.get("/feed", Userauth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    // Get all connection requests involving the logged-in user
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // Collect all user IDs to exclude from feed
    const excludeUserIds = new Set();
    excludeUserIds.add(loggedInUser._id.toString()); // Exclude self

    connectionRequests.forEach((request) => {
      excludeUserIds.add(request.fromUserId.toString());
      excludeUserIds.add(request.toUserId.toString());
    });

    // Fetch users not in exclude list with pagination
    const feed = await User.find({
      _id: { $nin: Array.from(excludeUserIds) },
    })
      .select("FirstName LastName Gender photoUrl About Skills")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Feed fetched successfully!",
      data: feed,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = userRouter;
