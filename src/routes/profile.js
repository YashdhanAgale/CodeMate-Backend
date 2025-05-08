const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validation");
const profileRouter = express.Router();
const ConnectionRequestModel = require("../models/connectionRequest");
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("Please login again ");
    }

    res.send(user);
  } catch (error) {}
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Validate the fields that can be updated dynamically
    const allowedFields = [
      "firstName",
      "lastName",
      "photoUrl",
      "gender",
      "age",
      "about",
      "skills",
    ];

    // Ensure that only allowed fields are being updated
    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return res
        .status(400)
        .send(`Invalid fields: ${invalidFields.join(", ")}`);
    }

    // Get the current logged-in user
    const loggedInUser = req.user;

    // Update the user fields based on the request body
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        loggedInUser[key] = req.body[key];
      }
    });

    // Save the updated user data
    await loggedInUser.save();

    res.json({
      message: `Profile updated successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = profileRouter;
