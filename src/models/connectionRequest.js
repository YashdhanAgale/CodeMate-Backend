const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["ignored", "interested", "accepted", "rejected"],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for quick lookups
connectionRequestSchema.index({
  fromUserId: 1,
  toUserId: 1,
});

// Middleware to prevent users from sending connection requests to themselves
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    return next(new Error("Cannot send the connection request to yourself!!!"));
  }
  next();
});

// Method to handle dynamic field updates (useful for profile updates or status change)
connectionRequestSchema.methods.updateFields = function (fieldsToUpdate) {
  // Dynamically update only the fields provided
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (this[key] !== undefined) {
      this[key] = fieldsToUpdate[key];
    }
  });

  return this.save();
};

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
