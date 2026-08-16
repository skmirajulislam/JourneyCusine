const Trip = require("../models/trip.model.js");
const User = require("../models/user.model.js");
const mongoose = require("mongoose");

exports.getUserTrips = async (req, res) => {
  try {
    const userId = req.user;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const trips = await Trip.find({
      $or: [{ userId: userObjId }, { "collaborators.userId": userObjId }],
    })
      .populate({
        path: "destinations.motelId",
        model: "House",
      })
      .populate({
        path: "shortlist.houseId",
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

    const user = await User.findById(userId);
    const ownerName = user?.name?.firstName
      ? `${user.name.firstName} ${user.name.lastName || ""}`.trim()
      : "Trip Leader";

    const newTrip = new Trip({
      userId: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
      description: description || "",
      startDate: startDate || null,
      endDate: endDate || null,
      destinations: [],
      collaborators: [
        {
          userId: new mongoose.Types.ObjectId(userId),
          email: user?.emailId || "owner@journeycuisine.com",
          name: ownerName,
          avatar: user?.profilePic || "",
          role: "owner",
          hasPaid: true,
          shareAmount: 0,
        },
      ],
      splitSettings: {
        splitType: "even",
        totalEstimatedCost: 0,
      },
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
      return res.status(404).json({ success: 0, error: "Trip not found or unauthorized" });
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
    const { id } = req.params;
    const { title, address, latitude, longitude, visitTime, notes, motelId } = req.body;

    if (!title || latitude === undefined || longitude === undefined || !visitTime) {
      return res.status(400).json({
        success: 0,
        error: "Title, coordinates (latitude, longitude), and visit time are required",
      });
    }

    const userObjId = new mongoose.Types.ObjectId(userId);
    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ userId: userObjId }, { "collaborators.userId": userObjId }],
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

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

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
    const userObjId = new mongoose.Types.ObjectId(userId);

    const trip = await Trip.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        $or: [{ userId: userObjId }, { "collaborators.userId": userObjId }],
      },
      {
        $pull: { destinations: { _id: new mongoose.Types.ObjectId(destId) } },
      },
      { new: true }
    )
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

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

    const userObjId = new mongoose.Types.ObjectId(userId);
    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ userId: userObjId }, { "collaborators.userId": userObjId }],
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

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

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
    const userObjId = new mongoose.Types.ObjectId(userId);

    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ userId: userObjId }, { "collaborators.userId": userObjId }],
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

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

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

// COLLABORATION ENDPOINTS

/**
 * Invite a collaborator to a trip
 * POST /trips/:id/invite
 * Body: { email, name, role }
 */
exports.inviteCollaborator = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { email, name, role } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: 0, error: "Collaborator email is required" });
    }

    const userObjId = new mongoose.Types.ObjectId(userId);
    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ userId: userObjId }, { "collaborators.userId": userObjId }],
    });

    if (!trip) {
      return res.status(404).json({ success: 0, error: "Trip not found" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = trip.collaborators.find((c) => c.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: 0, error: "Collaborator already invited" });
    }

    // Check if user registered
    const foundUser = await User.findOne({ emailId: normalizedEmail });

    trip.collaborators.push({
      userId: foundUser ? foundUser._id : null,
      email: normalizedEmail,
      name: name || foundUser?.name?.firstName || "Co-Traveler",
      avatar: foundUser?.profilePic || "",
      role: role || "editor",
      hasPaid: false,
      shareAmount: 0,
    });

    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

    res.status(200).json({
      success: 1,
      message: `Invited ${normalizedEmail} to trip!`,
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("inviteCollaborator error:", error);
    res.status(500).json({ success: 0, error: "Failed to invite collaborator" });
  }
};

/**
 * Join a trip using a shareable invite code
 * POST /trips/join/:inviteCode
 */
exports.joinTripByInvite = async (req, res) => {
  try {
    const userId = req.user;
    const { inviteCode } = req.params;

    if (!inviteCode) {
      return res.status(400).json({ success: 0, error: "Invite code is required" });
    }

    const trip = await Trip.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!trip) {
      return res.status(404).json({ success: 0, error: "Invalid or expired trip invite link" });
    }

    const user = await User.findById(userId);
    const userObjId = new mongoose.Types.ObjectId(userId);

    const isAlreadyMember = trip.collaborators.some(
      (c) =>
        (c.userId && String(c.userId) === String(userId)) ||
        c.email.toLowerCase() === user.emailId.toLowerCase()
    );

    if (!isAlreadyMember) {
      trip.collaborators.push({
        userId: userObjId,
        email: user.emailId,
        name: user.name?.firstName
          ? `${user.name.firstName} ${user.name.lastName || ""}`.trim()
          : "Co-Traveler",
        avatar: user.profilePic || "",
        role: "editor",
        hasPaid: false,
        shareAmount: 0,
      });

      await trip.save();
    }

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

    res.status(200).json({
      success: 1,
      message: `You've joined the trip "${trip.name}"!`,
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("joinTripByInvite error:", error);
    res.status(500).json({ success: 0, error: "Failed to join trip" });
  }
};

/**
 * Toggle or update split payment status for a collaborator
 * PATCH /trips/:id/split_status
 * Body: { collaboratorId, hasPaid, shareAmount, totalCost }
 */
exports.updateSplitStatus = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { collaboratorId, hasPaid, shareAmount, totalCost } = req.body;

    const userObjId = new mongoose.Types.ObjectId(userId);
    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ userId: userObjId }, { "collaborators.userId": userObjId }],
    });

    if (!trip) {
      return res.status(404).json({ success: 0, error: "Trip not found" });
    }

    if (totalCost !== undefined) {
      trip.splitSettings.totalEstimatedCost = Number(totalCost) || 0;
    }

    if (collaboratorId) {
      const collab = trip.collaborators.id(collaboratorId);
      if (collab) {
        if (hasPaid !== undefined) collab.hasPaid = Boolean(hasPaid);
        if (shareAmount !== undefined) collab.shareAmount = Number(shareAmount) || 0;
      }
    }

    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

    res.status(200).json({
      success: 1,
      message: "Split payment status updated!",
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("updateSplitStatus error:", error);
    res.status(500).json({ success: 0, error: "Failed to update split payment" });
  }
};
