const validator = require("validator");

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

const validateProfileData = (req) => {
  const valid = [
    "FirstName",
    "LastName",
    "Gender",
    "photoUrl",
    "About",
    "Skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
};

module.exports = {
  validateSignupData,
  validateProfileData,
};
