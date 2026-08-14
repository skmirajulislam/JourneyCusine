const Trip = require("../models/trip.model.js");
const mongoose = require("mongoose");

exports.getUserTrips = async (req, res) => {
  try {
    const userId = req.user;
    const trips = await Trip.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate({
        path: "destinations.motelId",
        model: "House",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: 1, trips });
  } catch (error) {
    console.error("getUserTrips error:", error);
    res.status(500).json({ success: 0, error: "Failed to fetch trips" });
  }
};

exports.createTrip = async (req, res) => {
  try {
    const userId = req.user;
    const { name, description, startDate, endDate } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: 0, error: "Trip name is required" });
    }

    const newTrip = new Trip({
      userId: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
      description: description || "",
      startDate: startDate || null,
      endDate: endDate || null,
      destinations: [],
    });

    const savedTrip = await newTrip.save();
    res.status(201).json({ success: 1, message: "Trip created successfully!", trip: savedTrip });
  } catch (error) {
    console.error("createTrip error:", error);
    res.status(500).json({ success: 0, error: "Failed to create trip" });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    const deleted = await Trip.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!deleted) {
      return res.status(404).json({ success: 0, error: "Trip not found" });
    }

    res.status(200).json({ success: 1, message: "Trip deleted successfully" });
  } catch (error) {
    console.error("deleteTrip error:", error);
    res.status(500).json({ success: 0, error: "Failed to delete trip" });
  }
};

exports.addDestination = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params; // trip id
    const { title, address, latitude, longitude, visitTime, notes, motelId } = req.body;

    if (!title || latitude === undefined || longitude === undefined || !visitTime) {
      return res.status(400).json({
        success: 0,
        error: "Title, coordinates (latitude, longitude), and visit time are required",
      });
    }

    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!trip) {
      return res.status(404).json({ success: 0, error: "Trip not found" });
    }

    const newDest = {
      title,
      address: address || "",
      latitude: Number(latitude),
      longitude: Number(longitude),
      visitTime: new Date(visitTime),
      notes: notes || "",
      motelId: motelId ? new mongoose.Types.ObjectId(motelId) : null,
      activities: [],
      notified: false,
    };

    trip.destinations.push(newDest);
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id).populate({
      path: "destinations.motelId",
      model: "House",
    });

    res.status(200).json({
      success: 1,
      message: "Destination added to trip!",
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("addDestination error:", error);
    res.status(500).json({ success: 0, error: "Failed to add destination" });
  }
};

exports.removeDestination = async (req, res) => {
  try {
    const userId = req.user;
    const { id, destId } = req.params;

    const trip = await Trip.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      {
        $pull: { destinations: { _id: new mongoose.Types.ObjectId(destId) } },
      },
      { new: true }
    ).populate({
      path: "destinations.motelId",
      model: "House",
    });

    if (!trip) {
      return res.status(404).json({ success: 0, error: "Trip not found" });
    }

    res.status(200).json({
      success: 1,
      message: "Destination removed from trip",
      trip,
    });
  } catch (error) {
    console.error("removeDestination error:", error);
    res.status(500).json({ success: 0, error: "Failed to remove destination" });
  }
};

exports.addActivity = async (req, res) => {
  try {
    const userId = req.user;
    const { id, destId } = req.params;
    const { title, time, notes } = req.body;

    if (!title || !time) {
      return res.status(400).json({ success: 0, error: "Activity title and time are required" });
    }

    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!trip) {
      return res.status(404).json({ success: 0, error: "Trip not found" });
    }

    const destination = trip.destinations.id(destId);
    if (!destination) {
      return res.status(404).json({ success: 0, error: "Destination not found" });
    }

    if (!destination.activities) {
      destination.activities = [];
    }

    destination.activities.push({
      title: title.trim(),
      time: new Date(time),
      notes: notes || "",
      notified: false,
    });

    await trip.save();

    const populatedTrip = await Trip.findById(trip._id).populate({
      path: "destinations.motelId",
      model: "House",
    });

    res.status(200).json({
      success: 1,
      message: "Activity added successfully!",
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("addActivity error:", error);
    res.status(500).json({ success: 0, error: "Failed to add activity" });
  }
};

exports.removeActivity = async (req, res) => {
  try {
    const userId = req.user;
    const { id, destId, activityId } = req.params;

    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!trip) {
      return res.status(404).json({ success: 0, error: "Trip not found" });
    }

    const destination = trip.destinations.id(destId);
    if (!destination) {
      return res.status(404).json({ success: 0, error: "Destination not found" });
    }

    destination.activities.pull({ _id: new mongoose.Types.ObjectId(activityId) });
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id).populate({
      path: "destinations.motelId",
      model: "House",
    });

    res.status(200).json({
      success: 1,
      message: "Activity removed",
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("removeActivity error:", error);
    res.status(500).json({ success: 0, error: "Failed to remove activity" });
  }
};
