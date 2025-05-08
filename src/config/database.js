const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://yashodhanagale3:yash@namastenode.kko7j.mongodb.net/codeMateDB"
  );
};

module.exports = connectDB;
