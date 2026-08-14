const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: "",
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  visitTime: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  motelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    default: null,
  },
  activities: [
    {
      title: { type: String, required: true },
      time: { type: Date, required: true },
      notes: { type: String, default: "" },
      notified: { type: Boolean, default: false },
    },
  ],
  notified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  destinations: [destinationSchema],
}, { timestamps: true });

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
