const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestsRouter = require("./routes/requests");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
require("dotenv").config();
const http = require("http");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// Creating server socket.io
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(process.env.PORT, () =>
      console.log(`server is listening on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.log("Database cannot be connected");
  });
