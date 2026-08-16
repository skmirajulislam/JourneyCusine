const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    time: { type: Date, required: true },
    notes: { type: String, default: "" },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const destinationSchema = new mongoose.Schema(
  {
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
    activities: [activitySchema],
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const collaboratorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userDB",
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      default: "Traveler",
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["owner", "editor", "viewer"],
      default: "editor",
    },
    hasPaid: {
      type: Boolean,
      default: false,
    },
    shareAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const shortlistSchema = new mongoose.Schema(
  {
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    votes: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "userDB" },
        userName: String,
        voteType: { type: String, enum: ["love", "like", "dislike"], default: "love" },
      },
    ],
  },
  { timestamps: true }
);

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userDB",
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
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    collaborators: [collaboratorSchema],
    destinations: [destinationSchema],
    shortlist: [shortlistSchema],
    splitSettings: {
      splitType: { type: String, enum: ["even", "custom"], default: "even" },
      totalEstimatedCost: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure invite code exists
tripSchema.pre("save", function (next) {
  if (!this.inviteCode) {
    this.inviteCode = `TRIP_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
  next();
});

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
