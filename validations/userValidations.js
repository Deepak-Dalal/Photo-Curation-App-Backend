function validateNewUserDetails(username, email) {
  const errors = [];
  if (!username) {
    errors.push("username is required");
  }
  if (!email) {
    errors.push("email is required");
  } else if (!email.includes(".") || !email.includes("@")) {
    errors.push("email format is incorrect");
  }
  return errors;
}

module.exports = { validateNewUserDetails };
