const  validator  = require("validator");

const validateSignupData = (req) => {
  const { FirstName, LastName, Email, Password } = req.body;
  if (!FirstName || !LastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(Email)) {
    throw new Error("Email is not Valid");
  } else if (!validator.isStrongPassword(Password)) {
    throw new Error("Password is not Strong");
  }
};

module.exports = {
  validateSignupData,
};
