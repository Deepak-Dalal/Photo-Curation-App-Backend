const { user: userModel } = require("../models");
const { validateNewUserDetails } = require("../validations/userValidations");
const { doesUserExist } = require("../services/userService");

const createNewUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    const errors = validateNewUserDetails(username, email);
    if (errors.length > 0) return res.status(400).send({ errors });

    const userExists = await doesUserExist(email);
    if (!userExists) {
      const newUser = await userModel.create({
        username,
        email,
      });

      res
        .status(200)
        .json({ message: "User created successfully", user: newUser });
    } else {
      res.status(400).json({ error: "User with the email already exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create new user" });
  }
};

module.exports = { createNewUser };
