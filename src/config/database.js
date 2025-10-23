const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const dbConnection = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database Connected Successfully !! ");
};

module.exports = dbConnection;
