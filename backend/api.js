const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const auth = require("./routes/auth.js");
const house = require("./routes/house.js");
const reservations = require("./routes/reservations.js");

require("dotenv").config();


const app = express();

// parse Data
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use("/auth", auth);
app.use("/house", house);
app.use("/reservations", reservations);


async function main() {
  const mongoUri =
    process.env.MONGODB_URI ||
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tkzvadc.mongodb.net/${process.env.DB_NAME || "motel-development-db"}`;

  try {
    await mongoose.connect(mongoUri);
    const port = process.env.PORT || 5001;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Unable to start the server:", error.message);
    process.exitCode = 1;
  }
}

app.get("/", (req, res) => {
  res.send(`Express server is working on ${process.env.PORT || 5001}`);
});

main();
