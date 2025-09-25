const express = require("express");
const app = express();

app.use("/test", (req, res) => {
  res.send("Response from Server !!!");
});

app.listen(3000, () => {
  console.log("Server is Listening on Port 3000✅ ...");
});
