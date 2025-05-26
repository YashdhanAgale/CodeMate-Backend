const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // Read the token form req cookies
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        message: "Please Login",
      });
    }
    // validate the token
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = decodedObj;

    // Find the user
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User Not found");
    }
    // attach the user
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("ERROR" + error.message);
  }
};

module.exports = { userAuth };
