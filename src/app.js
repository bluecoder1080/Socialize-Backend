const express = require("express");
const app = express();
const dbConnection = require("./config/database");
const User = require("./models/user");

app.use(express.json());

app.post("/signup", async (req, res) => {
  console.log(req.body);
  // Creating a new instsnce in user !
  const user = new User(req.body);
  try {
    await user.save();
    res.send("User Added Successfully !!!");
  } catch (err) {
    res.status(400).send("Error While Saving the user" + err.message);
  }
});
//It will be search user by Email .
app.get("/user", async (req, res) => {
  try {
    const email = req.body.email;
    console.log("hi");
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
    const user = await User.findByIdAndDelete({_id : id});
    res.send("User Deleted !!");
  } catch (e) {
    res.send("There is error which is " + e);
  }
});

//It will Update by id .
app.patch("/user", async (req, res) => {
  const id = req.body.id;
  const content = req.body;
  try {
    const user = await User.findByIdAndUpdate({_id : id},content);
    res.send("User Updated  !!");
  } catch (e) {
    res.send("There is error which is " + e);
  }
});

dbConnection().then(() => {
  console.log("Database Established !! ");
  app.listen(3000, () => {
    console.log("Server is Listening to Port 3000");
  });
});
