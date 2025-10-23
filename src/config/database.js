const mongoose = require("mongoose");

const dbConnection = async () => {
  await mongoose.connect(
    "mongodb+srv://isagi21:Adity12@cluster0.bnowp2w.mongodb.net/Socialize"
  );
  console.log("Database Connected Successfully !! ");
};


module.exports = dbConnection
