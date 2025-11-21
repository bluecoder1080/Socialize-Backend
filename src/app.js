const express = require("express");
const app = express();
const dbConnection = require("./config/database");
const User = require("./models/user");
const { validateSignupData } = require("./utils/validator");
const bcrypt = require("bcrypt");
var cookieParser = require("cookie-parser");
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { Userauth } = require("../middlewares/auth");
dotenv.config();

app.use(express.json());
app.use(cookieParser());
// Signup End Point .
app.post("/signup", async (req, res) => {
  try {
    // Validate The User .
    validateSignupData(req);

    // Getting The Contents from User !
    const { FirstName, LastName, Email, Password } = req.body;

    //  3. Check if user with same email already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res
        .status(400)
        .send("A user with this email already exists! Please log in instead.");
    }

    // Encrypting The Password.
    const PasswordHash = await bcrypt.hash(Password, 10);

    // Creating New Instance of User .
    const user = new User({
      FirstName,
      LastName,
      Email,
      Password: PasswordHash,
    });

    await user.save();
    res.send("User Added Successfully !!!");
  } catch (err) {
    res.status(400).send("Error While Saving the user" + err.message);
  }
});

// Signin End Point .
app.post("/signin", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const user = await User.findOne({ Email }).select("+Password");

    if (!user) {
      throw new Error("Invalid Credentials !");
    }

    const IsPasswordValid = await bcrypt.compare(Password, user.Password);

    if (IsPasswordValid) {
      // Token in form of cookie !

      var token = jwt.sign({ _id: user._id }, "process.env.JWT_SECRET_KEY");

      res.cookie("token", token);
      res.send("Login Successfull ! ");
    } else {
      throw new Error("Invalid Credentials !");
    }
  } catch (err) {
    res.status(400).send("The Error is " + err);
  }
});
//Profile Section
app.get("/profile", Userauth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.send("The error is " + err.message);
  }
});
//It will be search user by Email .
app.get("/user", async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.find({ Email: email });
    if (user.length === 0) {
      res.send("User Does Not Exist !! ");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.send("The error is " + error);
  }
});

// It will Give all feed Users .
app.get("/feed", async (req, res) => {
  try {
    const user = await User.find({});
    if (user) {
      res.send(user);
    }
  } catch (e) {
    res.send("the error is " + e);
  }
});

// It will find By id
app.get("/fid", async (req, res) => {
  try {
    const _idProvided = req.body._idProvided;
    const user = await User.findById({ _id: _idProvided });
    if (user) {
      res.send(user);
    }
  } catch (error) {
    res.send("the error is : " + error);
  }
});

//It will find by id and delete
app.delete("/user", async (req, res) => {
  const id = req.body.id;
  try {
    const user = await User.findByIdAndDelete({ _id: id });
    res.send("User Deleted !!");
  } catch (e) {
    res.send("There is error which is " + e);
  }
});

//It will Update by id .
app.patch("/user/:id", async (req, res) => {
  // const userId = req.params?.userId
  const id = req.params?.id;
  const content = req.body;
  try {
    const ALLOWED_UPDATES = ["photoUrl", "About", "Gender", "Age"];
    const isUpdateAllowed = Object.keys(content).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Updates Not Allowed");
    }
    const user = await User.findByIdAndUpdate(id, content, {
      runValidators: true,
    });

    res.status(200).send({ message: "User updated!" });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

dbConnection().then(() => {
  console.log("Database Established !! ");
  app.listen(3000, () => {
    console.log("Server is Listening to Port 3000");
  });
});
