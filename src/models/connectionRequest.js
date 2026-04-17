const mongoose = require("mongoose");
const { Schema } = mongoose;
const ConnectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "ignored", "rejected", "interested"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
ConnectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  // check if from user and to user is same or not
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to the same");
  }
  next();
});

ConnectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
module.exports = mongoose.model("ConnectionRequest", ConnectionRequestSchema);
