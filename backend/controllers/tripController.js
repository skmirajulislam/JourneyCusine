const Trip = require("../models/trip.model.js");
const User = require("../models/user.model.js");
const mongoose = require("mongoose");
const { sendNotification } = require("./notificationController.js");

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

    // Clean duplicate collaborators from existing trips
    for (const trip of trips) {
      const originalCount = trip.collaborators?.length || 0;
      cleanCollaborators(trip);
      if (trip.collaborators?.length !== originalCount) {
        await trip.save();
      }
    }

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

// Helper to deduplicate collaborators in a trip
const cleanCollaborators = (trip) => {
  if (!trip || !trip.collaborators) return;
  const seenEmails = new Set();
  const seenUserIds = new Set();
  const unique = [];

  for (const c of trip.collaborators) {
    const emailKey = (c.email || "").trim().toLowerCase();
    const userKey = c.userId ? String(c.userId) : null;

    let isDup = false;
    if (userKey && seenUserIds.has(userKey)) {
      isDup = true;
    }
    if (emailKey && seenEmails.has(emailKey)) {
      isDup = true;
    }

    if (!isDup) {
      if (emailKey) seenEmails.add(emailKey);
      if (userKey) seenUserIds.add(userKey);
      unique.push(c);
    }
  }
  trip.collaborators = unique;
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

    cleanCollaborators(trip);

    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = await User.findOne({ emailId: normalizedEmail });

    const existing = trip.collaborators.find(
      (c) =>
        (c.email && c.email.toLowerCase() === normalizedEmail) ||
        (foundUser && c.userId && String(c.userId) === String(foundUser._id))
    );

    if (existing) {
      return res.status(400).json({ success: 0, error: "Co-traveler already added to this trip" });
    }

    trip.collaborators.push({
      userId: foundUser ? foundUser._id : null,
      email: normalizedEmail,
      name: name || (foundUser?.name?.firstName ? `${foundUser.name.firstName} ${foundUser.name.lastName || ""}`.trim() : "Co-Traveler"),
      avatar: foundUser?.profileImg || "",
      role: role || "editor",
      hasPaid: false,
      shareAmount: 0,
    });

    cleanCollaborators(trip);
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

    // Send real-time notification to invited user if they exist in DB
    const io = req.app.get("io");
    if (io && foundUser?._id) {
      await sendNotification(io, {
        userId: foundUser._id,
        title: "Trip Invitation Received! 💌",
        message: `You've been invited to join group trip "${trip.name || "Trip"}". Code: ${trip.inviteCode}`,
        type: "trip",
        link: "/trips",
      });
    }

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
    const normalizedUserEmail = (user?.emailId || "").toLowerCase();

    cleanCollaborators(trip);

    // Look for existing collaborator entry (e.g. invited by email prior to joining)
    const existingIndex = trip.collaborators.findIndex(
      (c) =>
        (c.userId && String(c.userId) === String(userId)) ||
        (c.email && c.email.toLowerCase() === normalizedUserEmail)
    );

    if (existingIndex !== -1) {
      // Update existing record with actual user data if needed
      trip.collaborators[existingIndex].userId = userObjId;
      trip.collaborators[existingIndex].email = normalizedUserEmail;
      if (user?.name?.firstName) {
        trip.collaborators[existingIndex].name = `${user.name.firstName} ${user.name.lastName || ""}`.trim();
      }
      if (user?.profileImg) {
        trip.collaborators[existingIndex].avatar = user.profileImg;
      }
    } else {
      trip.collaborators.push({
        userId: userObjId,
        email: normalizedUserEmail,
        name: user?.name?.firstName
          ? `${user.name.firstName} ${user.name.lastName || ""}`.trim()
          : "Co-Traveler",
        avatar: user?.profileImg || "",
        role: "editor",
        hasPaid: false,
        shareAmount: 0,
      });
    }

    cleanCollaborators(trip);
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

    // Send notification to Trip Leader
    const io = req.app.get("io");
    if (io && trip.userId && String(trip.userId) !== String(userId)) {
      const joinerName = user?.name?.firstName
        ? `${user.name.firstName} ${user.name.lastName || ""}`.trim()
        : user?.emailId || "A co-traveler";

      await sendNotification(io, {
        userId: trip.userId,
        title: "New Co-Traveler Joined! 🎒",
        message: `${joinerName} has joined your group trip "${trip.name || "Trip"}"!`,
        type: "trip",
        link: "/trips",
      });
    }

    // Send confirmation notification to the joining user
    if (io && userId) {
      await sendNotification(io, {
        userId,
        title: "You've Joined a Trip! 🗺️",
        message: `You are now connected to "${trip.name || "Trip"}". All scheduled activities and split budget are synced.`,
        type: "trip",
        link: "/trips",
      });
    }

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
 * Remove a collaborator from a trip
 * DELETE /trips/:id/collaborators/:collaboratorId
 */
exports.removeCollaborator = async (req, res) => {
  try {
    const userId = req.user;
    const { id, collaboratorId } = req.params;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const trip = await Trip.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ userId: userObjId }, { "collaborators.userId": userObjId }],
    });

    if (!trip) {
      return res.status(404).json({ success: 0, error: "Trip not found" });
    }

    // Only trip owner or the collaborator themselves can remove
    const isOwner = String(trip.userId) === String(userId);
    const targetCollab = trip.collaborators.id(collaboratorId);

    if (!targetCollab) {
      return res.status(404).json({ success: 0, error: "Collaborator not found in trip" });
    }

    const isSelf = targetCollab.userId && String(targetCollab.userId) === String(userId);

    if (!isOwner && !isSelf) {
      return res.status(403).json({ success: 0, error: "Only the trip owner can remove members" });
    }

    trip.collaborators.pull({ _id: new mongoose.Types.ObjectId(collaboratorId) });
    cleanCollaborators(trip);
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

    res.status(200).json({
      success: 1,
      message: "Co-traveler removed from trip",
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("removeCollaborator error:", error);
    res.status(500).json({ success: 0, error: "Failed to remove collaborator" });
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

    cleanCollaborators(trip);

    if (totalCost !== undefined) {
      trip.splitSettings.totalEstimatedCost = Number(totalCost) || 0;
    }

    if (collaboratorId) {
      const collab = trip.collaborators.id(collaboratorId);
      if (collab) {
        const isOwner = String(trip.userId) === String(userId);
        const userDoc = await User.findById(userId);
        const isSelf =
          (collab.userId && String(collab.userId) === String(userId)) ||
          (userDoc && collab.email && collab.email.toLowerCase() === (userDoc.emailId || "").toLowerCase());

        if (!isOwner && !isSelf) {
          return res.status(403).json({
            success: 0,
            error: "You can only update your own payment status",
          });
        }

        if (hasPaid !== undefined) collab.hasPaid = Boolean(hasPaid);
        if (shareAmount !== undefined) collab.shareAmount = Number(shareAmount) || 0;
      }
    }

    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate({ path: "destinations.motelId", model: "House" })
      .populate({ path: "shortlist.houseId", model: "House" });

    // Send real-time notification to Trip Owner if a collaborator updated their payment
    const io = req.app.get("io");
    if (io && collaboratorId) {
      const collab = trip.collaborators.id(collaboratorId);
      if (collab && trip.userId && String(trip.userId) !== String(userId)) {
        await sendNotification(io, {
          userId: trip.userId,
          title: "Payment Status Updated! 💳",
          message: `${collab.name || collab.email} marked their split payment as ${collab.hasPaid ? "Paid ✅" : "Pending ⏳"} for "${trip.name || "Trip"}".`,
          type: "trip",
          link: "/trips",
        });
      }
    }

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
