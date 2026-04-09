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

module.exports = mongoose.model("ConnectionRequest", ConnectionRequestSchema);
