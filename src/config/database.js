const mongoose = require("mongoose");

const dbConnection = async () => {
  await mongoose.connect(
    "REMOVED_SECRET"
  );
  console.log("Database Connected Successfully !! ");
};


module.exports = dbConnection
