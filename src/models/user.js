const mongoose = require("mongoose");
var validator = require("validator");


const userSchema = new mongoose.Schema(
  {
    FirstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least 2 characters long"],
      trim: true,
    },

    LastName: {
      type: String,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address" + value);
        }
      },
    },
    Password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password Is Weak");
        }
      },
    },
    Gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ["male", "female", "others"],
        message: "Gender is not valid!",
      },
      default: "others",
    },
    photoUrl: {
      type: String,
      default:
        "https://www.pngitem.com/pimgs/m/272-2720656_user-profile-dummy-hd-png-download.png",
    },
    About: {
      type: String,
      default: "Here to find someone who understands recursion 💞",
    },
    Skills: [String],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
