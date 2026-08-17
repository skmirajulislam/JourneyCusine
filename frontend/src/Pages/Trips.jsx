import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiClock,
  FiCalendar,
  FiNavigation,
  FiCheckCircle,
  FiBell,
  FiHeart,
  FiX,
  FiSearch,
  FiMap,
  FiList,
  FiActivity,
  FiUsers,
  FiUserPlus,
  FiShare2,
  FiDollarSign,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { FadeLoader, PulseLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import api, { API } from "../backend";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

// Custom Leaflet Motel Marker Icon with Dynamic Width and Theme Awareness
const createMotelIcon = (formattedPrice, isDark = false) => {
  const bg = isDark ? "#18181b" : "#ffffff";
  const text = isDark ? "#ffffff" : "#111827";
  const border = isDark ? "#ff385c" : "#111827";
  const shadow = isDark
    ? "0 4px 14px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.15)"
    : "0 3px 10px rgba(0,0,0,0.28)";

  return L.divIcon({
    className: "custom-motel-marker",
    html: `<div style="
      background-color: ${bg};
      color: ${text};
      font-weight: 800;
      font-size: 11.5px;
      padding: 4.5px 10px;
      border-radius: 9999px;
      box-shadow: ${shadow};
      border: 1.8px solid ${border};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      white-space: nowrap;
      width: max-content;
      transform: translate(-50%, -50%);
    ">
      <span style="font-size: 11px; line-height: 1;">🏨</span>
      <span style="color: ${text}; font-weight: 800; letter-spacing: -0.2px; line-height: 1.2;">${formattedPrice || "$100"}</span>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Custom Leaflet Trip Destination Marker Icon with Theme Awareness
const createDestIcon = (number, isPast, isDark = false) => {
  const bg = isPast ? "#10b981" : "#ff385c";
  const border = isDark ? "#18181b" : "#ffffff";
  const shadow = isDark
    ? "0 4px 14px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.2)"
    : "0 4px 12px rgba(0,0,0,0.4)";

  return L.divIcon({
    className: "custom-dest-marker",
    html: `<div style="
      background-color: ${bg};
      color: white;
      font-weight: 800;
      font-size: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      box-shadow: ${shadow};
      border: 2.5px solid ${border};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      ${number}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Click handler component for the map
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// FlyTo coordinator component
const MapController = ({ targetCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 13, { duration: 1.2 });
    }
  }, [targetCoords, map]);
  return null;
};

// Audio notification chime using Web Audio API
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);
  } catch (err) {
    console.error("Audio notification error:", err);
  }
};

// Isolated Live Countdown Timer Badge Component
const CountdownBadge = React.memo(({ visitTime, title, destId, notifiedSet, compact = false }) => {
  const [timeState, setTimeState] = useState(() => calculateDiff(visitTime));

  function calculateDiff(time) {
    const diff = new Date(time).getTime() - Date.now();
    if (diff <= 0) {
      return { text: "Active / Passed", isPast: true, diff };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return { text: `In ${days}d ${hours}h`, isPast: false, diff };
    }
    if (hours > 0) {
      return { text: `In ${hours}h ${minutes}m ${seconds}s`, isPast: false, diff };
    }
    return { text: `In ${minutes}m ${seconds}s`, isPast: false, diff };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const state = calculateDiff(visitTime);
      setTimeState(state);

      if (state.diff <= 60000 && state.diff > -3600000 && !notifiedSet.current.has(destId)) {
        notifiedSet.current.add(destId);
        playNotificationSound();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("⏰ Reminder Alert!", {
            body: `It's time for: ${title}!`,
            icon: "/motel-logo.png",
          });
        }
        toast.success(`⏰ Time for ${title}!`, { duration: 6000 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visitTime, title, destId, notifiedSet]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${
        compact ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      } ${
        timeState.isPast
          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
          : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse"
      }`}
    >
      {timeState.isPast ? (
        <>
          <FiCheckCircle size={compact ? 11 : 13} /> {timeState.text}
        </>
      ) : (
        <>
          <FiBell size={compact ? 11 : 13} /> {timeState.text}
        </>
      )}
    </span>
  );
});

CountdownBadge.displayName = "CountdownBadge";

const Trips = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { formatPrice } = useCurrency();

  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [motels, setMotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mobile View Mode: 'split' on desktop, 'list' or 'map' on mobile
  const [mobileView, setMobileView] = useState("list"); // 'map' or 'list'
  const [searchQuery, setSearchQuery] = useState("");

  // Group Collaboration & Split-Pay States
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [activeTripTab, setActiveTripTab] = useState("itinerary"); // "itinerary" | "group"
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Modals & UI states
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inputInviteCode, setInputInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [showAddDestModal, setShowAddDestModal] = useState(false);
  const [showWishlistPicker, setShowWishlistPicker] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [targetDestForActivity, setTargetDestForActivity] = useState(null);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);

  // Form states for new trip
  const [newTripName, setNewTripName] = useState("");
  const [newTripDesc, setNewTripDesc] = useState("");

  // Form states for new destination
  const [destTitle, setDestTitle] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [destDate, setDestDate] = useState("");
  const [destTime, setDestTime] = useState("10:00");
  const [destNotes, setDestNotes] = useState("");
  const [destMotelId, setDestMotelId] = useState(null);

  // Form states for sub-activity
  const [actTitle, setActTitle] = useState("");
  const [actDate, setActDate] = useState("");
  const [actTime, setActTime] = useState("12:00");
  const [actNotes, setActNotes] = useState("");

  const notifiedDestinations = useRef(new Set());

  // Auto-join group trip if user lands with invite code
  useEffect(() => {
    if (inviteCode && user) {
      async function joinGroup() {
        try {
          const res = await api.post(`/trips/join/${inviteCode}`);
          if (res.data?.success === 1) {
            toast.success(res.data.message);
            setActiveTrip(res.data.trip);
            setTrips((prev) => {
              const existing = prev.find((t) => t._id === res.data.trip._id);
              if (existing) {
                return prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t));
              }
              return [res.data.trip, ...prev];
            });
            setActiveTripTab("group");
            navigate("/trips", { replace: true });
          }
        } catch (err) {
          console.error("join trip error:", err);
          toast.error(err.response?.data?.error || "Failed to join trip");
        }
      }
      joinGroup();
    }
  }, [inviteCode, user, navigate]);

  // Request browser notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch all motels once on mount
  useEffect(() => {
    async function loadMotels() {
      try {
        const res = await fetch(`${API}house/get_all_listing`);
        const data = await res.json();
        if (data?.succeed === 1) {
          const validMotels = (data.allListingData || [])
            .map((house) => {
              const lat =
                parseFloat(house.location?.city?.latitude) ||
                parseFloat(house.location?.state?.latitude) ||
                parseFloat(house.location?.country?.latitude);
              const lng =
                parseFloat(house.location?.city?.longitude) ||
                parseFloat(house.location?.state?.longitude) ||
                parseFloat(house.location?.country?.longitude);
              if (!isNaN(lat) && !isNaN(lng)) {
                return {
                  ...house,
                  lat,
                  lng,
                };
              }
              return null;
            })
            .filter(Boolean);
          setMotels(validMotels);
        }
      } catch (err) {
        console.error("Failed to load motels for map:", err);
      }
    }
    loadMotels();
  }, []);

  // Fetch user's saved trips ONCE per user
  useEffect(() => {
    async function fetchTrips() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await api.get("/trips");
        if (res.data?.success === 1) {
          const loadedTrips = res.data.trips || [];
          setTrips(loadedTrips);
          if (loadedTrips.length > 0) {
            setActiveTrip(loadedTrips[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load trips:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrips();
  }, [user]);

  // Filtered motels based on search query
  const filteredMotels = useMemo(() => {
    if (!searchQuery.trim()) return motels;
    const q = searchQuery.toLowerCase();
    return motels.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.location?.city?.name?.toLowerCase().includes(q) ||
        m.location?.country?.name?.toLowerCase().includes(q)
    );
  }, [motels, searchQuery]);

  // Handle map click to drop a new pin
  const handleMapClick = (latlng) => {
    if (!user) {
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }
    if (!activeTrip && trips.length === 0) {
      toast.error("Please create a trip first to add destination pins!");
      setShowNewTripModal(true);
      return;
    }
    setSelectedCoords(latlng);
    setDestTitle("");
    setDestAddress(`Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`);
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    setDestDate(tomorrow.toISOString().split("T")[0]);
    setDestMotelId(null);
    setShowAddDestModal(true);
  };

  // Create a new trip
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    try {
      const res = await api.post("/trips", {
        name: newTripName.trim(),
        description: newTripDesc.trim(),
      });
      if (res.data?.success === 1) {
        toast.success(res.data.message);
        setTrips((prev) => [res.data.trip, ...prev]);
        setActiveTrip(res.data.trip);
        setShowNewTripModal(false);
        setNewTripName("");
        setNewTripDesc("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create trip");
    }
  };

  // Delete trip
  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip and its itinerary?")) return;

    try {
      const res = await api.delete(`/trips/${tripId}`);
      if (res.data?.success === 1) {
        toast.success("Trip deleted");
        const remaining = trips.filter((t) => t._id !== tripId);
        setTrips(remaining);
        setActiveTrip(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete trip");
    }
  };

  // Add destination to current active trip
  const handleSaveDestination = async (e) => {
    e.preventDefault();
    if (!destTitle || !destDate || !selectedCoords || !activeTrip) return;

    const scheduledDateTime = new Date(`${destDate}T${destTime || "10:00"}`);

    try {
      const res = await api.post(`/trips/${activeTrip._id}/destinations`, {
        title: destTitle,
        address: destAddress,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        visitTime: scheduledDateTime,
        notes: destNotes,
        motelId: destMotelId,
      });

      if (res.data?.success === 1) {
        toast.success("Destination pinned & added to itinerary!");
        setActiveTrip(res.data.trip);
        setTrips((prev) =>
          prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t))
        );
        setShowAddDestModal(false);
        setDestTitle("");
        setDestNotes("");
        setDestMotelId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add destination");
    }
  };

  // Remove destination
  const handleRemoveDestination = async (destId) => {
    if (!activeTrip) return;
    try {
      const res = await api.delete(
        `/trips/${activeTrip._id}/destinations/${destId}`
      );
      if (res.data?.success === 1) {
        toast.success("Destination removed from itinerary");
        setActiveTrip(res.data.trip);
        setTrips((prev) =>
          prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove destination");
    }
  };

  // Open Add Activity Modal for a destination
  const handleOpenAddActivity = (dest) => {
    setTargetDestForActivity(dest);
    setActTitle("");
    const destDay = dest.visitTime ? new Date(dest.visitTime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    setActDate(destDay);
    setActTime("15:00");
    setActNotes("");
    setShowAddActivityModal(true);
  };

  // Save sub-activity
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!actTitle.trim() || !actDate || !activeTrip || !targetDestForActivity) return;

    const scheduledDateTime = new Date(`${actDate}T${actTime || "12:00"}`);

    try {
      const res = await api.post(
        `/trips/${activeTrip._id}/destinations/${targetDestForActivity._id}/activities`,
        {
          title: actTitle.trim(),
          time: scheduledDateTime,
          notes: actNotes.trim(),
        }
      );

      if (res.data?.success === 1) {
        toast.success("Activity & timer added!");
        setActiveTrip(res.data.trip);
        setTrips((prev) =>
          prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t))
        );
        setShowAddActivityModal(false);
        setActTitle("");
        setActNotes("");
        setTargetDestForActivity(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add activity");
    }
  };

  // Remove sub-activity
  const handleRemoveActivity = async (destId, activityId) => {
    if (!activeTrip) return;
    try {
      const res = await api.delete(
        `/trips/${activeTrip._id}/destinations/${destId}/activities/${activityId}`
      );
      if (res.data?.success === 1) {
        toast.success("Activity removed");
        setActiveTrip(res.data.trip);
        setTrips((prev) =>
          prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove activity");
    }
  };

  // Group Collaboration Handlers
  const handleInviteCollaborator = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeTrip) return;
    try {
      setIsInviting(true);
      const res = await api.post(`/trips/${activeTrip._id}/invite`, {
        email: inviteEmail.trim(),
      });
      if (res.data?.success === 1) {
        toast.success(res.data.message);
        setActiveTrip(res.data.trip);
        setTrips((prev) =>
          prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t))
        );
        setInviteEmail("");
      }
    } catch (err) {
      console.error("invite error:", err);
      toast.error(err.response?.data?.error || "Failed to invite co-traveler");
    } finally {
      setIsInviting(false);
    }
  };

  const handleTogglePaidStatus = async (collabId, currentStatus) => {
    if (!activeTrip) return;
    try {
      const res = await api.patch(`/trips/${activeTrip._id}/split_status`, {
        collaboratorId: collabId,
        hasPaid: !currentStatus,
      });
      if (res.data?.success === 1) {
        setActiveTrip(res.data.trip);
        setTrips((prev) =>
          prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t))
        );
        toast.success("Payment status updated!");
      }
    } catch (err) {
      console.error("split status error:", err);
      toast.error("Failed to update status");
    }
  };

  const handleUpdateTotalCost = async (newTotal) => {
    if (!activeTrip) return;
    try {
      const res = await api.patch(`/trips/${activeTrip._id}/split_status`, {
        totalCost: Number(newTotal) || 0,
      });
      if (res.data?.success === 1) {
        setActiveTrip(res.data.trip);
        setTrips((prev) =>
          prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t))
        );
        toast.success("Total estimated trip budget updated!");
      }
    } catch (err) {
      console.error("update total cost error:", err);
    }
  };

  const handleRemoveCollaborator = async (collabId) => {
    if (!activeTrip) return;
    try {
      const res = await api.delete(
        `/trips/${activeTrip._id}/collaborators/${collabId}`
      );
      if (res.data?.success === 1) {
        setActiveTrip(res.data.trip);
        setTrips((prev) =>
          prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t))
        );
        toast.success("Co-traveler removed from trip");
      }
    } catch (err) {
      console.error("remove collaborator error:", err);
      toast.error(err.response?.data?.error || "Failed to remove co-traveler");
    }
  };

  const handleCopyInviteLink = () => {
    if (!activeTrip?.inviteCode) return;
    const link = `${window.location.origin}/trips/join/${activeTrip.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Group invite link copied to clipboard!");
  };

  const handleJoinByCode = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }
    if (!inputInviteCode || !inputInviteCode.trim()) {
      toast.error("Please enter a trip invite code or link");
      return;
    }

    // Extract code if user pasted full URL (e.g. .../trips/join/TRIP_12345)
    let rawInput = inputInviteCode.trim();
    let code = rawInput;
    if (rawInput.includes("/trips/join/")) {
      code = rawInput.split("/trips/join/")[1]?.split("?")[0]?.split("/")[0] || rawInput;
    } else if (rawInput.includes("/")) {
      const parts = rawInput.split("/").filter(Boolean);
      code = parts[parts.length - 1] || rawInput;
    }

    code = code.trim().toUpperCase();
    setIsJoining(true);
    try {
      const res = await api.post(`/trips/join/${code}`);
      if (res.data?.success === 1 && res.data.trip) {
        toast.success(res.data.message || "Joined trip successfully!");
        setTrips((prev) => {
          const exists = prev.some((t) => t._id === res.data.trip._id);
          if (exists) {
            return prev.map((t) => (t._id === res.data.trip._id ? res.data.trip : t));
          }
          return [res.data.trip, ...prev];
        });
        setActiveTrip(res.data.trip);
        setActiveTripTab("group");
        setShowJoinModal(false);
        setInputInviteCode("");
      }
    } catch (err) {
      console.error("join code error:", err);
      toast.error(err.response?.data?.error || "Invalid or expired trip invite code");
    } finally {
      setIsJoining(false);
    }
  };

  // Add a motel directly to active trip
  const handleAddMotelToTrip = (motel) => {
    if (!user) {
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }
    if (!activeTrip && trips.length === 0) {
      toast.error("Please create a trip first to add this motel!");
      setShowNewTripModal(true);
      return;
    }

    setSelectedCoords({ lat: motel.lat, lng: motel.lng });
    setDestTitle(motel.title || "Motel Stay");
    setDestAddress(
      `${motel.location?.addressLineOne || ""}, ${motel.location?.city?.name || ""}, ${motel.location?.country?.name || ""}`
    );
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    setDestDate(tomorrow.toISOString().split("T")[0]);
    setDestTime("14:00");
    setDestMotelId(motel._id);
    setShowAddDestModal(true);
  };

  // Fetch wishlist items for import picker
  const handleOpenWishlistPicker = async () => {
    if (!user) {
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }
    try {
      const res = await api.get("/auth/wishlist");
      if (res.data?.success === 1) {
        setWishlistItems(res.data.wishlist || []);
        setShowWishlistPicker(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wishlist");
    }
  };

  // Sorted destinations by visit time
  const sortedDestinations = useMemo(() => {
    if (!activeTrip?.destinations) return [];
    return [...activeTrip.destinations].sort(
      (a, b) => new Date(a.visitTime) - new Date(b.visitTime)
    );
  }, [activeTrip]);

  const computedMotelCost = useMemo(() => {
    if (!activeTrip?.destinations) return 0;
    return activeTrip.destinations.reduce((sum, d) => {
      if (d.motelId && d.motelId.basePrice) {
        return sum + Number(d.motelId.basePrice);
      }
      return sum;
    }, 0);
  }, [activeTrip?.destinations]);

  const totalTripCost = activeTrip?.splitSettings?.totalEstimatedCost || computedMotelCost || 0;
  const collaborators = useMemo(() => {
    const raw = activeTrip?.collaborators || [];
    const seen = new Set();
    const unique = [];
    for (const c of raw) {
      const key = (c.userId ? String(c.userId) : c.email || "").trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
    }
    return unique;
  }, [activeTrip?.collaborators]);

  const collaboratorCount = Math.max(1, collaborators.length);
  const perPersonShare = Math.round(totalTripCost / collaboratorCount);
  const paidCount = collaborators.filter((c) => c.hasPaid).length;
  const totalCollected = collaborators.reduce(
    (sum, c) => sum + (c.hasPaid ? perPersonShare : 0),
    0
  );
  const paidPercent =
    totalTripCost > 0
      ? Math.min(100, Math.round((totalCollected / totalTripCost) * 100))
      : collaborators.length > 0 && paidCount === collaborators.length
      ? 100
      : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[75vh]">
        <FadeLoader color="#ff385c" />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100dvh-80px)] w-full overflow-hidden bg-[#fafafa] dark:bg-[#121212]">
      {/* Main Responsive Layout */}
      <div className="flex flex-col lg:flex-row h-full w-full">
        
        {/* Sidebar (Itinerary & Trip Details) */}
        <div
          className={`w-full lg:w-[460px] xl:w-[500px] h-full flex flex-col border-r border-[#e5e7eb] dark:border-[#262626] bg-white dark:bg-[#181818] overflow-y-auto shrink-0 z-20 shadow-xl ${
            mobileView === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Header & Trip Selection with Clean Margins & Padding */}
          <div className="pt-5 px-5 pb-4 border-b border-[#e5e7eb] dark:border-[#262626] sticky top-0 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md z-20">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <h1 className="text-2xl font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
                  <FiNavigation className="text-[#ff385c]" /> Trips Planner
                </h1>
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
                  Pin destinations, schedule activities &amp; live timers
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      window.dispatchEvent(new Event("open-auth-popup"));
                      return;
                    }
                    setShowJoinModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title="Paste invite code to join a trip"
                >
                  <FiUsers size={14} /> Join Trip
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      window.dispatchEvent(new Event("open-auth-popup"));
                      return;
                    }
                    setShowNewTripModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <FiPlus size={16} /> New Trip
                </button>
              </div>
            </div>

            {/* Trip Selector Pills with ample top/bottom margins */}
            {trips.length > 0 ? (
              <div className="pt-2 pb-1.5 px-0.5 flex items-center gap-2.5 overflow-x-auto [scrollbar-width:none]">
                {trips.map((trip) => (
                  <button
                    key={trip._id}
                    type="button"
                    onClick={() => setActiveTrip(trip)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-sm ${
                      activeTrip?._id === trip._id
                        ? "bg-[#111827] text-white dark:bg-white dark:text-[#111827] ring-2 ring-[#ff385c] shadow-md transform scale-[1.02]"
                        : "bg-[#f3f4f6] dark:bg-[#262626] text-[#374151] dark:text-[#d1d5db] hover:bg-[#e5e7eb]"
                    }`}
                  >
                    {trip.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] py-2 italic">
                No trips created yet. Click &ldquo;New Trip&rdquo; to start!
              </div>
            )}
          </div>

          {/* Active Trip Content */}
          <div className="p-5 flex-1 overflow-y-auto pb-24 lg:pb-8">
            {activeTrip ? (
              <div>
                {/* Trip Banner Card */}
                <div className="flex items-start justify-between bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-[#202020] dark:to-[#1a1a1a] p-4 rounded-2xl border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-sm mb-5">
                  <div className="flex-1 pr-3">
                    <h2 className="text-lg font-bold text-[#111827] dark:text-white">
                      {activeTrip.name}
                    </h2>
                    {activeTrip.description && (
                      <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1 leading-relaxed">
                        {activeTrip.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2.5 text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af]">
                      <FiMapPin className="text-[#ff385c]" />
                      <span>
                        {sortedDestinations.length} destination
                        {sortedDestinations.length !== 1 ? "s" : ""} scheduled
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTrip(activeTrip._id)}
                    title="Delete Trip"
                    className="p-2 text-[#6b7280] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                {/* Wishlist Import & Map Pinning Hint */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-5">
                  <button
                    type="button"
                    onClick={handleOpenWishlistPicker}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl border border-[#d1d5db] dark:border-[#374151] hover:bg-neutral-50 dark:hover:bg-[#222222] text-xs font-bold text-[#111827] dark:text-white transition-all shadow-sm cursor-pointer"
                  >
                    <FiHeart className="text-[#ff385c]" /> Add from Wishlist
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileView("map")}
                    className="lg:hidden flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-[#111827] text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    <FiMap /> Open Map
                  </button>
                </div>

                {/* Sub-tab Switcher: Itinerary vs Group & Split-Pay */}
                <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-5">
                  <button
                    type="button"
                    onClick={() => setActiveTripTab("itinerary")}
                    className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTripTab === "itinerary"
                        ? "border-[#ff385c] text-[#ff385c]"
                        : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    <FiClock size={14} />
                    <span>Itinerary &amp; Timers ({sortedDestinations.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTripTab("group")}
                    className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTripTab === "group"
                        ? "border-[#ff385c] text-[#ff385c]"
                        : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    <FiUsers size={14} />
                    <span>Group &amp; Split-Pay ({collaborators.length})</span>
                  </button>
                </div>

                {activeTripTab === "group" ? (
                  /* Group & Split-Pay Panel */
                  <div className="space-y-5">
                    {/* Split Pay Overview Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 dark:from-[#201518] dark:via-[#191919] dark:to-[#1a1715] border border-rose-200 dark:border-rose-950/60 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-[#ff385c] text-white">
                            <FiDollarSign size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                              Group Split-Pay
                            </h4>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {collaboratorCount} co-traveler{collaboratorCount !== 1 ? "s" : ""} sharing costs
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">
                            Each Person Pays
                          </span>
                          <span className="text-base font-extrabold text-[#ff385c]">
                            {formatPrice(perPersonShare)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                          <span>Collected: {formatPrice(totalCollected)}</span>
                          <span>
                            {paidCount} of {collaboratorCount} paid ({paidPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Total Budget Edit Form */}
                      <div className="mt-3 pt-3 border-t border-rose-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-neutral-500">
                          Total Trip Budget (USD $):
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            defaultValue={totalTripCost}
                            onBlur={(e) => handleUpdateTotalCost(e.target.value)}
                            className="w-24 px-2 py-1 text-xs font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#222] text-neutral-900 dark:text-white text-right"
                          />
                          <span className="text-[11px] font-semibold text-neutral-400">
                            ({formatPrice(totalTripCost)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Invite Co-Travelers Card */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-xs">
                      <h4 className="text-xs font-bold text-[#111827] dark:text-white flex items-center gap-1.5 mb-2">
                        <FiShare2 className="text-[#ff385c]" />
                        <span>Invite Friends to Group Trip</span>
                      </h4>

                      {/* Share Link Button */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-600 dark:text-neutral-400 truncate font-mono">
                          Code: <span className="font-bold text-[#ff385c]">{activeTrip.inviteCode || "TRIP_INVITE"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyInviteLink}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                        >
                          <FiCopy size={13} />
                          <span>Copy Link</span>
                        </button>
                      </div>

                      {/* Direct Email Invite Form */}
                      <form onSubmit={handleInviteCollaborator} className="flex gap-2">
                        <input
                          type="email"
                          placeholder="friend@email.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#181818] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff385c]"
                        />
                        <button
                          type="submit"
                          disabled={!inviteEmail.trim() || isInviting}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 disabled:opacity-40 text-xs font-bold transition cursor-pointer shrink-0"
                        >
                          {isInviting ? (
                            <PulseLoader size={4} color="#fff" />
                          ) : (
                            <>
                              <FiUserPlus size={13} />
                              <span>Invite</span>
                            </>
                          )}
                        </button>
                      </form>

                      {/* Paste Other Invite Code Shortcut */}
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500">Have another trip&apos;s invite code?</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!user) {
                              window.dispatchEvent(new Event("open-auth-popup"));
                              return;
                            }
                            setShowJoinModal(true);
                          }}
                          className="font-bold text-[#ff385c] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <FiUsers size={12} /> Join with Code
                        </button>
                      </div>
                    </div>

                    {/* Group Members List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#111827] dark:text-white flex items-center justify-between">
                        <span>Co-Travelers &amp; Payment Status</span>
                        <span className="text-[11px] font-normal text-neutral-500">Tap status to toggle</span>
                      </h4>

                      {collaborators.map((collab, idx) => {
                        const isMe =
                          user?._id &&
                          (String(collab.userId) === String(user._id) ||
                            collab.email === user.emailId);
                        const name = collab.name || collab.email.split("@")[0];
                        const isTripOwner =
                          user?._id && String(activeTrip?.userId) === String(user._id);
                        const canToggle = isTripOwner || isMe;

                        return (
                          <div
                            key={collab._id || idx}
                            className="p-3 rounded-2xl bg-white dark:bg-[#202020] border border-[#e5e7eb] dark:border-[#2e2e2e] shadow-2xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                                {collab.avatar ? (
                                  <img
                                    src={collab.avatar}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  name[0]
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                                  <span>{name}</span>
                                  {isMe && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-[#ff385c] font-semibold">
                                      You
                                    </span>
                                  )}
                                  {collab.role === "owner" && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold">
                                      Leader
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-neutral-400 truncate">
                                  {collab.email} • Share: {formatPrice(perPersonShare)}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons: Toggle Payment & Remove Member */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                disabled={!canToggle}
                                title={
                                  canToggle
                                    ? "Click to toggle payment status"
                                    : "Only this member or the trip leader can update payment status"
                                }
                                onClick={() =>
                                  canToggle &&
                                  handleTogglePaidStatus(collab._id, collab.hasPaid)
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition ${
                                  canToggle ? "cursor-pointer" : "cursor-default opacity-85"
                                } ${
                                  collab.hasPaid
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
                                }`}
                              >
                                {collab.hasPaid ? (
                                  <>
                                    <FiCheck size={13} />
                                    <span>Paid</span>
                                  </>
                                ) : (
                                  <span>Pending</span>
                                )}
                              </button>

                              {collab.role !== "owner" && (isTripOwner || isMe) && (
                                <button
                                  type="button"
                                  title={isMe ? "Leave trip" : "Remove member"}
                                  onClick={() => handleRemoveCollaborator(collab._id)}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Itinerary Timeline */
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                        <FiClock className="text-[#ff385c]" /> Itinerary &amp; Timers
                      </h3>
                      <span className="text-[11px] font-medium text-[#6b7280] dark:text-[#9ca3af]">
                        Chronological
                      </span>
                    </div>

                    {sortedDestinations.length === 0 ? (
                      <div className="text-center py-12 px-4 border border-dashed border-[#d1d5db] dark:border-[#333333] rounded-2xl bg-neutral-50 dark:bg-[#1f1f1f]">
                        <FiMapPin className="mx-auto text-4xl text-[#9ca3af] mb-2" />
                        <p className="text-sm font-bold text-[#111827] dark:text-white">
                          No destinations in this trip yet
                        </p>
                        <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1 max-w-xs mx-auto leading-relaxed">
                          Tap any motel on the map or click anywhere to drop a pin for
                          local attractions with a reminder timer.
                        </p>
                        <button
                          type="button"
                          onClick={() => setMobileView("map")}
                          className="mt-4 px-4 py-2 rounded-xl bg-[#ff385c] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                        >
                          <FiMap /> Pin on Map
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sortedDestinations.map((dest, idx) => {
                          const isMotel = Boolean(dest.motelId);
                          const activities = dest.activities || [];

                          return (
                            <div
                              key={dest._id}
                              className="p-4 rounded-2xl border transition-all bg-white dark:bg-[#202020] border-[#e5e7eb] dark:border-[#2e2e2e] shadow-sm hover:shadow-md"
                            >
                              {/* Destination Main Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3 flex-1">
                                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0 mt-0.5 bg-[#ff385c] shadow-sm">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-extrabold text-[#111827] dark:text-white truncate">
                                      {dest.title}
                                    </h4>
                                    {dest.address && (
                                      <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] truncate mt-0.5">
                                        {dest.address}
                                      </p>
                                    )}

                                    {/* Scheduled Date & Time */}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-[#374151] dark:text-[#d1d5db]">
                                      <span className="flex items-center gap-1">
                                        <FiCalendar className="text-[#ff385c]" />
                                        {new Date(dest.visitTime).toLocaleDateString(
                                          undefined,
                                          {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          }
                                        )}
                                      </span>
                                      <span className="flex items-center gap-1 font-bold">
                                        <FiClock className="text-[#ff385c]" />
                                        {new Date(dest.visitTime).toLocaleTimeString(
                                          [],
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}
                                      </span>
                                    </div>

                                    {/* Live Countdown Badge */}
                                    <div className="mt-2.5">
                                      <CountdownBadge
                                        visitTime={dest.visitTime}
                                        title={dest.title}
                                        destId={dest._id}
                                        notifiedSet={notifiedDestinations}
                                      />
                                    </div>

                                    {/* Notes section */}
                                    {dest.notes && (
                                      <div className="mt-2.5 text-xs text-[#374151] dark:text-[#d1d5db] bg-[#f9fafb] dark:bg-[#171717] p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                        <span className="font-semibold text-[#111827] dark:text-white">Note: </span>
                                        <span className="italic">&ldquo;{dest.notes}&rdquo;</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-1 items-end shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMapTarget([dest.latitude, dest.longitude]);
                                      setMobileView("map");
                                    }}
                                    title="Focus on Map"
                                    className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FiNavigation size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDestination(dest._id)}
                                    title="Remove Pin"
                                    className="p-1.5 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Motel Details Card if this destination is linked to a Motel */}
                              {isMotel && dest.motelId && (
                                <div className="mt-3.5 p-3 rounded-xl bg-[#f9fafb] dark:bg-[#171717] border border-neutral-200 dark:border-[#2e2e2e] flex items-center gap-3">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-neutral-200">
                                    <img
                                      src={dest.motelId.photos?.[0] || "/placeholder.jpg"}
                                      alt={dest.motelId.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[#111827] dark:text-white truncate">
                                      {dest.motelId.title}
                                    </p>
                                    <p className="text-xs text-[#ff385c] font-extrabold mt-0.5">
                                      {formatPrice(dest.motelId.basePrice, dest.motelId.currency || dest.motelId.author?.currency || "INR")}
                                      <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af] font-normal">
                                        {" "}/ night
                                      </span>
                                    </p>
                                  </div>
                                  <Link
                                    to={`/rooms/${dest.motelId._id}`}
                                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:opacity-90 shrink-0"
                                  >
                                    View Stay
                                  </Link>
                                </div>
                              )}

                              {/* Sub-Activities Timeline within this Destination */}
                              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-[#2a2a2a]">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-[#374151] dark:text-[#d1d5db] flex items-center gap-1.5">
                                    <FiActivity className="text-[#ff385c]" />
                                    Activities &amp; Stops ({activities.length})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddActivity(dest)}
                                    className="text-xs font-bold text-[#ff385c] hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <FiPlus size={12} /> Add Activity
                                  </button>
                                </div>

                                {activities.length > 0 ? (
                                  <div className="space-y-2 pl-2 border-l-2 border-[#ff385c]/40">
                                    {activities.map((act) => (
                                      <div
                                        key={act._id}
                                        className="p-2.5 rounded-xl bg-[#f9fafb] dark:bg-[#181818] border border-neutral-100 dark:border-neutral-800 text-xs"
                                      >
                                        <div className="flex items-start justify-between gap-1">
                                          <span className="font-bold text-[#111827] dark:text-white">
                                            {act.title}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveActivity(dest._id, act._id)
                                            }
                                            title="Delete Activity"
                                            className="text-[#9ca3af] hover:text-red-500 cursor-pointer p-0.5"
                                          >
                                            <FiTrash2 size={12} />
                                          </button>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
                                          <FiClock size={11} className="text-[#ff385c]" />
                                          <span>
                                            {new Date(act.time).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>

                                        {act.notes && (
                                          <p className="text-[11px] text-[#4b5563] dark:text-[#9ca3af] italic mt-1">
                                            &ldquo;{act.notes}&rdquo;
                                          </p>
                                        )}

                                        {/* Sub-activity Live Countdown Badge */}
                                        <div className="mt-1.5">
                                          <CountdownBadge
                                            visitTime={act.time}
                                            title={act.title}
                                            destId={act._id}
                                            notifiedSet={notifiedDestinations}
                                            compact={true}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-[#9ca3af] italic">
                                    No side-activities added yet. Click &ldquo;+ Add Activity&rdquo; for scuba, dinner, tour reminders!
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FiNavigation className="text-5xl text-[#ff385c] mb-3" />
                <h3 className="text-lg font-bold text-[#111827] dark:text-white">
                  No active trip selected
                </h3>
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] max-w-xs mt-1 mb-5">
                  Create a trip to organize destinations, interactive map pins, and
                  visit reminders.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      window.dispatchEvent(new Event("open-auth-popup"));
                      return;
                    }
                    setShowNewTripModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  Create your first trip
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map Container View */}
        <div
          className={`flex-1 h-full relative ${
            mobileView === "list" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Top Floating Map Controls: Motel Search & Action Hint */}
          <div className="absolute top-4 left-14 sm:left-16 right-4 z-[500] flex flex-col sm:flex-row items-center gap-3 pointer-events-none">
            <div className="relative flex-1 w-full max-w-md pointer-events-auto shadow-lg rounded-2xl">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search motels by city, country or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#ff385c]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-black/75 dark:bg-neutral-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl text-white text-xs font-semibold shadow-lg pointer-events-auto">
              <FiMapPin className="text-[#ff385c]" />
              <span>Tap anywhere on map to drop a pin</span>
            </div>
          </div>

          <MapContainer
            center={[23.0, 80.0]}
            zoom={4}
            minZoom={2}
            worldCopyJump={true}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
          >
            <TileLayer
              key={isDark ? "dark-map-tiles" : "light-map-tiles"}
              url={
                isDark
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {mapTarget && <MapController targetCoords={mapTarget} />}

            {/* Motel Pins (Repeated seamlessly across all world copies) */}
            {filteredMotels.flatMap((motel) =>
              [-720, -360, 0, 360, 720].map((offset) => (
                <Marker
                  key={`${motel._id}_${offset}`}
                  position={[motel.lat, motel.lng + offset]}
                  icon={createMotelIcon(formatPrice(motel.basePrice, motel.currency || motel.author?.currency || "INR"), isDark)}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 max-w-[220px] text-gray-900 dark:text-white">
                      {motel.photos?.[0] && (
                        <img
                          src={motel.photos[0]}
                          alt={motel.title}
                          className="w-full h-28 object-cover rounded-xl mb-2"
                        />
                      )}
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                        {motel.title || "Motel Stay"}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">
                        {motel.location?.city?.name || (typeof motel.location?.city === "string" ? motel.location.city : "")},{" "}
                        {motel.location?.country?.name || (typeof motel.location?.country === "string" ? motel.location.country : "")}
                      </p>
                      <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-1">
                        {formatPrice(motel.basePrice, motel.currency || motel.author?.currency || "INR")} <span className="font-normal text-gray-500 dark:text-neutral-400">/ night</span>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold my-1">
                        <AiFillStar size={12} />
                        <span>{motel.ratings || "New"}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <Link
                          to={`/rooms/${motel._id}`}
                          className="flex-1 text-center py-1.5 px-2 rounded-xl bg-[#111827] dark:bg-white text-white dark:text-[#111827] text-xs font-bold hover:bg-black dark:hover:bg-neutral-200 transition"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddMotelToTrip(motel)}
                          className="flex-1 text-center py-1.5 px-2 rounded-xl bg-[#ff385c] text-white text-xs font-bold hover:bg-[#d90b63] transition cursor-pointer"
                        >
                          + Add Trip
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))
            )}

            {/* Scheduled Destination Pins for Active Trip (Repeated seamlessly across all world copies) */}
            {sortedDestinations.flatMap((dest, idx) => {
              const isPast = new Date(dest.visitTime).getTime() <= Date.now();
              return [-720, -360, 0, 360, 720].map((offset) => (
                <Marker
                  key={`${dest._id}_${offset}`}
                  position={[dest.latitude, dest.longitude + offset]}
                  icon={createDestIcon(idx + 1, isPast, isDark)}
                >
                  <Popup>
                    <div className="p-1 max-w-[200px] text-gray-900 dark:text-white">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff385c]">
                        Stop #{idx + 1}
                      </span>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mt-0.5">
                        {dest.title}
                      </h4>
                      {dest.address && (
                        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                          {dest.address}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1">
                        ⏰ {new Date(dest.visitTime).toLocaleString()}
                      </p>
                      {dest.activities?.length > 0 && (
                        <p className="text-[11px] text-[#ff385c] font-semibold mt-1">
                          🎯 {dest.activities.length} side activit{dest.activities.length === 1 ? "y" : "ies"} scheduled
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(dest._id)}
                        className="mt-2.5 w-full py-1 text-center rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/60 transition cursor-pointer"
                      >
                        Remove Pin
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ));
            })}
          </MapContainer>
        </div>
      </div>

      {/* Floating Bottom Switcher for Mobile Devices */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="flex items-center bg-black/85 dark:bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-white/20">
          <button
            type="button"
            onClick={() => setMobileView("map")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              mobileView === "map"
                ? "bg-[#ff385c] text-white shadow-md"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            <FiMap size={14} /> Map View
          </button>
          <button
            type="button"
            onClick={() => setMobileView("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              mobileView === "list"
                ? "bg-[#ff385c] text-white shadow-md"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            <FiList size={14} /> Itinerary ({sortedDestinations.length})
          </button>
        </div>
      </div>

      {/* Modal: Create New Trip */}
      {showNewTripModal && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#111827] dark:text-white">
                Create a New Trip
              </h3>
              <button
                type="button"
                onClick={() => setShowNewTripModal(false)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Trip Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Euro Tour, Himalayan Retreat"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Notes about your itinerary..."
                  value={newTripDesc}
                  onChange={(e) => setNewTripDesc(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTripModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-[#111827] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Trip by Invite Code or Link */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <FiUsers className="text-[#ff385c]" /> Join a Group Trip
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setInputInviteCode("");
                }}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">
              Paste the invite code or share link provided by your group trip leader to get full access to the itinerary, motel voting, and split expenses.
            </p>

            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1.5">
                  Invite Code or Share URL *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRIP_5HPJ62R or https://.../trips/join/TRIP_..."
                  value={inputInviteCode}
                  onChange={(e) => setInputInviteCode(e.target.value)}
                  required
                  autoFocus
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c] font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setInputInviteCode("");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-[#111827] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inputInviteCode.trim() || isJoining}
                  className="px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {isJoining ? (
                    <PulseLoader size={6} color="#fff" />
                  ) : (
                    <>
                      <FiCheck size={16} />
                      <span>Join Trip</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Destination / Scheduled Visit Pin */}
      {showAddDestModal && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <FiMapPin className="text-[#ff385c]" /> Add Destination &amp; Timer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDestModal(false)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveDestination} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Destination / Attraction Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunset Point, Historic Fort, Beach Cafe"
                  value={destTitle}
                  onChange={(e) => setDestTitle(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Address / Landmark
                </label>
                <input
                  type="text"
                  placeholder="City, landmark, or street"
                  value={destAddress}
                  onChange={(e) => setDestAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={destDate}
                    onChange={(e) => setDestDate(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    type="time"
                    value={destTime}
                    onChange={(e) => setDestTime(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Notes / Activities
                </label>
                <input
                  type="text"
                  placeholder="e.g. scuba diving, mountain hike"
                  value={destNotes}
                  onChange={(e) => setDestNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div className="bg-neutral-50 dark:bg-[#262626] p-3 rounded-xl text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-2 border border-neutral-200 dark:border-neutral-700">
                <FiBell className="text-[#ff385c] text-base shrink-0" />
                <span>
                  App will notify you with audio &amp; alarm when it is time to
                  visit this attraction.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDestModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-[#111827] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  Save &amp; Start Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Sub-Activity with Custom Time & Timer */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <FiActivity className="text-[#ff385c]" /> Add Activity &amp; Sub-Timer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddActivityModal(false)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-4">
              Adding sub-activity to: <strong className="text-[#111827] dark:text-white">{targetDestForActivity?.title}</strong>
            </p>

            <form onSubmit={handleSaveActivity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Activity Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scuba diving session, Sunset cruise, Bonfire"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                    Activity Date *
                  </label>
                  <input
                    type="date"
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                    Activity Time *
                  </label>
                  <input
                    type="time"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] dark:text-white mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bring gear, meet at pier #3"
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] text-sm text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-[#111827] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  Add Activity &amp; Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pick from Wishlist */}
      {showWishlistPicker && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <FiHeart className="text-[#ff385c]" /> Add from Saved Wishlist
              </h3>
              <button
                type="button"
                onClick={() => setShowWishlistPicker(false)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#6b7280] dark:text-[#9ca3af]">
                  No motels in your wishlist yet.
                </div>
              ) : (
                wishlistItems.map((item) => {
                  const lat =
                    parseFloat(item.location?.city?.latitude) ||
                    parseFloat(item.location?.state?.latitude) ||
                    parseFloat(item.location?.country?.latitude) ||
                    23.0;
                  const lng =
                    parseFloat(item.location?.city?.longitude) ||
                    parseFloat(item.location?.state?.longitude) ||
                    parseFloat(item.location?.country?.longitude) ||
                    80.0;

                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#262626] transition-all"
                    >
                      <img
                        src={item.photos?.[0]}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#111827] dark:text-white truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] truncate">
                          {item.location?.city?.name},{" "}
                          {item.location?.country?.name}
                        </p>
                        <p className="text-xs font-bold text-[#111827] dark:text-white mt-0.5">
                          {formatPrice(item.basePrice, item.currency || item.author?.currency || "INR")} / night
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowWishlistPicker(false);
                          handleAddMotelToTrip({
                            ...item,
                            lat,
                            lng,
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs font-bold shrink-0 transition-all cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
