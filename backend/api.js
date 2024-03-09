require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose")
const cors = require("cors")

const auth = require("./routes/auth")
const house = require("./routes/house")
const reservations = require("./routes/reservations")

const app = express();

// parse Data
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use("/auth", auth);
app.use("/house", house);
app.use("/reservations", reservations)


const port = 5000;

async function main() {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.in81gjk.mongodb.net/motel-develpoment-db`)
    try {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    } catch (err) {
        console.log(err)
    }
}

main();