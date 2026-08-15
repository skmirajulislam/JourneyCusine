const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const auth = require("./routes/auth.js");
const house = require("./routes/house.js");
const reservations = require("./routes/reservations.js");
const trips = require("./routes/trips.js");
const ai = require("./routes/ai.js");
const coupon = require("./routes/coupon.js");
const review = require("./routes/review.js");

require("dotenv").config();


const { createRouteHandler } = require("uploadthing/express");
const { uploadRouter } = require("./uploadthing.js");

const app = express();

// parse Data
app.use(express.json({ limit: "20mb" }));
app.use(cors());
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// UploadThing route handler
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_TOKEN,
    },
  })
);

// Use routes
app.use("/auth", auth);
app.use("/house", house);
app.use("/reservations", reservations);
app.use("/trips", trips);
app.use("/ai", ai);
app.use("/coupons", coupon);
app.use("/reviews", review);


async function main() {
  let mongoUri = process.env.MONGODB_URI || "";
  if (!mongoUri || mongoUri.endsWith("mongodb.net/")) {
    const dbName = process.env.DB_NAME || "motel-develpoment-db";
    mongoUri = mongoUri ? `${mongoUri}${dbName}` : `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tkzvadc.mongodb.net/${dbName}`;
  }

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
