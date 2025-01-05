const { user: userModel } = require("../models");

async function doesUserExist(email) {
  const user = await userModel.findOne({ where: { email } });
  return !!user;
}
module.exports = { doesUserExist };
