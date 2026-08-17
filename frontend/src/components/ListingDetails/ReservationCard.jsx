import { useMemo, useRef, useState } from "react";
import { AiFillStar, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { DateRange } from "react-date-range";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../backend";
import { parseISO } from "date-fns";
import { useCurrency } from "../../context/CurrencyContext";
import { useAuth } from "../../hooks/useAuth";

// date range selector css
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const ReservationCard = ({
  listingData,
  selectedCuisineAddons = [],
  onToggleCuisineAddon,
  isHost = false,
  onOpenHostEdit,
}) => {
  // refs
  const calendarRef = useRef();
  const dropdownRef = useRef();

  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const houseCurrency = listingData?.currency || listingData?.author?.currency || "INR";

  // handling outside click
  const { state: calendarState, setState: setCalendarState } =
    useOutsideClick(calendarRef);
  const { state: showDropdown, setState: setShowDropdown } =
    useOutsideClick(dropdownRef);

  // Max guests allowed by this listing's floor plan
  const maxAllowedGuests = Math.max(
    1,
    Number(listingData?.floorPlan?.guests) ||
      Number(listingData?.floorPlan?.guestNumber) ||
      Number(listingData?.guests) ||
      2
  );

  // guests state
  const [guestsNumber, setGuestsNumber] = useState(1);
  const [childrenNumber, setChildrenNumber] = useState(0);
  const totalGuest = guestsNumber + childrenNumber;

  // dates selection state
  const [selectedDates, setSelectedDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // Query saved reservations dates with caching
  const { data: reservations = [] } = useQuery({
    queryKey: ["listingReservations", listingData?._id],
    queryFn: async () => {
      if (!listingData?._id) return [];
      const res = await api.post("/reservations/get_reservations", {
        id: listingData._id,
      });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: Boolean(listingData?._id),
    staleTime: 5 * 60 * 1000,
  });

  // Calculate nights and prices as derived state
  const nightsStaying = useMemo(() => {
    const start = selectedDates[0]?.startDate;
    const end = selectedDates[0]?.endDate;
    if (!start || !end) return 1;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  }, [selectedDates]);

  // Calculate room price
  const roomBasePrice = useMemo(() => {
    const base = Number(listingData?.basePrice) || 50;
    return base * nightsStaying;
  }, [listingData?.basePrice, nightsStaying]);

  // Calculate cuisine add-ons price
  const cuisineTotalPrice = useMemo(() => {
    if (!Array.isArray(selectedCuisineAddons) || selectedCuisineAddons.length === 0) return 0;
    return selectedCuisineAddons.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || totalGuest),
      0
    );
  }, [selectedCuisineAddons, totalGuest]);

  const totalBeforeTaxes = roomBasePrice + cuisineTotalPrice;

  // formatted dates
  const formattedStartDate = selectedDates[0]?.startDate?.toISOString();
  const formattedEndDate = selectedDates[0]?.endDate?.toISOString();
  const localStartDate = selectedDates[0]?.startDate
    ? new Date(selectedDates[0].startDate).toLocaleDateString()
    : "";
  const localEndDate = selectedDates[0]?.endDate
    ? new Date(selectedDates[0].endDate).toLocaleDateString()
    : "";

  const handleSelect = (ranges) => {
    setSelectedDates([ranges.selection]);
  };

  // booking action
  const handleBooking = () => {
    if (isHost) {
      toast.error("You cannot reserve your own property!");
      return;
    }
    if (!user) {
      toast.error("Please log in or sign up to reserve a motel!");
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }
    if (totalGuest > maxAllowedGuests) {
      toast.error(
        `This listing allows a maximum of ${maxAllowedGuests} guest${
          maxAllowedGuests > 1 ? "s" : ""
        }.`
      );
      return;
    }
    const orderNumber = localStorage.getItem("orderId");
    const orderId = orderNumber ? orderNumber : 1;

    const cuisineParam =
      selectedCuisineAddons.length > 0
        ? `&cuisineAddons=${encodeURIComponent(JSON.stringify(selectedCuisineAddons))}`
        : "";

    navigate(
      `/book/stays/${listingData._id}?numberOfGuests=${totalGuest}&nightStaying=${nightsStaying}&checkin=${formattedStartDate}&checkout=${formattedEndDate}&orderId=${orderId}${cuisineParam}`
    );
  };

  // Calculate disabled date ranges
  const disabledDates = useMemo(() => {
    if (!Array.isArray(reservations) || reservations.length === 0) return [];

    const disabledDateRanges = reservations.map((obj) => ({
      startDate: parseISO(obj.checkIn),
      endDate: parseISO(obj.checkOut),
    }));

    return disabledDateRanges.reduce((dates, range) => {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    }, []);
  }, [reservations]);

  // If viewing own property, render host action controls instead of booking box
  if (isHost) {
    return (
      <div className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 sticky top-32 shadow-xl p-6 bg-white dark:bg-[#1e1e1e] space-y-5 animate-in fade-in">
        <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#ff385c] font-bold text-xs inline-flex items-center gap-1.5 mb-2">
              <span>🏠</span>
              <span>Your Motel Property</span>
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-[#111827] dark:text-white">
                {formatPrice(listingData?.basePrice || 50, houseCurrency)}
              </span>
              <span className="text-xs text-neutral-500">/ night</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
              ● Published &amp; Live
            </span>
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-[#282828] rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-700/60 space-y-2">
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
            <span>ℹ️ Host Controls</span>
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            You cannot reserve your own property. Use the quick controls below to update your motel details, edit dining options, or review guest bookings.
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onOpenHostEdit}
            className="w-full py-3.5 px-4 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>✏️ Edit Property &amp; Pricing</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/users/dashboard/${user?._id || ""}/listing=true`)}
            className="w-full py-3 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📊 Manage All Host Listings</span>
          </button>
        </div>

        <div className="text-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] text-neutral-400">
            Guest reservations and earnings appear in your host dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-[315px] rounded-xl border border-[#dddddd] dark:border-[#444444] sticky top-32 shadow-customShadow p-6 bg-white dark:bg-[#1e1e1e]">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col">
            <h3 className="text-[22px] text-[#222222] dark:text-white font-semibold">
              {formatPrice(totalBeforeTaxes, houseCurrency)}
            </h3>
            <p className="text-[#313131] dark:text-[#a0a0a0] text-sm">
              {cuisineTotalPrice > 0 ? "Stay + Dining before taxes" : "Total before taxes"}
            </p>
          </div>
          <span className="text-sm text-[#222222] dark:text-[#e5e7eb] flex flex-row gap-1 items-center mt-2">
            <AiFillStar size={18} />
            {listingData?.ratings ? listingData?.ratings : "New"}
            {listingData?.reviews && (
              <span>
                <span>·</span>
                <span>{listingData?.reviews}</span>
              </span>
            )}
          </span>
        </div>

        {/* calender section */}
        {!calendarState && (
          <div className="rounded-tl-lg rounded-tr-lg border border-[#b9b9b9] dark:border-[#555555] w-full min-h-[60px] mt-6 relative flex flex-col">
            <div>
              <div
                onClick={() => {
                  setCalendarState(true);
                }}
                className="grid grid-cols-2 cursor-pointer"
              >
                <div className="px-3 py-3">
                  <p className="text-[10px] text-black dark:text-white font-semibold uppercase">
                    check-in
                  </p>
                  <p className="text-sm text-[#222222] dark:text-[#e5e7eb]">{localStartDate}</p>
                </div>
                <div className="px-3 py-3 border-l border-[#b9b9b9] dark:border-[#555555]">
                  <p className="text-[10px] text-black dark:text-white font-semibold uppercase">
                    checkout
                  </p>
                  <p className="text-sm text-[#222222] dark:text-[#e5e7eb]">{localEndDate}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* guest selection */}
        {!calendarState && (
          <div
            ref={dropdownRef}
            onClick={() => {
              setShowDropdown((prev) => !prev);
            }}
          >
            <div className="rounded-bl-lg rounded-br-lg border border-[#b9b9b9] dark:border-[#555555] w-full min-h-[50px] cursor-pointer relative">
              <div className="px-3 py-3 flex flex-row items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[10px] text-black dark:text-white font-semibold uppercase">
                    guests
                  </p>
                  <p className="text-sm text-[#222222] dark:text-[#e5e7eb]">
                    {totalGuest} {totalGuest === 1 ? "guest" : "guests"}
                  </p>
                </div>
                <div>
                  {showDropdown ? (
                    <MdKeyboardArrowUp size={26} className="dark:text-white"/>
                  ) : (
                    <MdKeyboardArrowDown size={26} className="dark:text-white"/>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Cuisine Addons Preview */}
        {selectedCuisineAddons.length > 0 && !calendarState && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs">
            <div className="flex items-center justify-between font-bold text-rose-900 dark:text-rose-200 mb-1.5">
              <span>🍲 Dining Experiences Added ({selectedCuisineAddons.length})</span>
              <span>+{formatPrice(cuisineTotalPrice, houseCurrency)}</span>
            </div>
            <div className="space-y-1">
              {selectedCuisineAddons.map((addon, idx) => (
                <div key={idx} className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 text-[11px]">
                  <span className="truncate max-w-[170px]">• {addon.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span>{formatPrice(addon.price * (addon.quantity || totalGuest), houseCurrency)}</span>
                    {onToggleCuisineAddon && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCuisineAddon(addon);
                        }}
                        className="text-neutral-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                        title="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* guests data dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="min-h-[200px] w-72 shadow-xl border border-neutral-200 dark:border-[#444444] absolute z-[90] bg-white dark:bg-[#2a2a2a] px-4 py-5 rounded-xl"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <h4 className="text-base text-[#222222] dark:text-white font-medium">Adults</h4>
                  <p className="text-xs text-[#717171] dark:text-[#a0a0a0]">Age 13+</p>
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <button
                    type="button"
                    disabled={guestsNumber <= 1}
                    onClick={() => setGuestsNumber((prev) => Math.max(1, prev - 1))}
                    className="p-2 border rounded-full border-[#b0b0b0] dark:border-[#666666] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <AiOutlineMinus size={14} className="dark:text-white" />
                  </button>
                  <span className="text-sm font-semibold dark:text-white">{guestsNumber}</span>
                  <button
                    type="button"
                    disabled={totalGuest >= maxAllowedGuests}
                    onClick={() => {
                      if (totalGuest < maxAllowedGuests) {
                        setGuestsNumber((prev) => prev + 1);
                      }
                    }}
                    className="p-2 border rounded-full border-[#b0b0b0] dark:border-[#666666] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <AiOutlinePlus size={14} className="dark:text-white" />
                  </button>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between">
                <div>
                  <h4 className="text-base text-[#222222] dark:text-white font-medium">Children</h4>
                  <p className="text-xs text-[#717171] dark:text-[#a0a0a0]">Ages 2–12</p>
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <button
                    type="button"
                    disabled={childrenNumber <= 0}
                    onClick={() => setChildrenNumber((prev) => Math.max(0, prev - 1))}
                    className="p-2 border rounded-full border-[#b0b0b0] dark:border-[#666666] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <AiOutlineMinus size={14} className="dark:text-white" />
                  </button>
                  <span className="text-sm font-semibold dark:text-white">{childrenNumber}</span>
                  <button
                    type="button"
                    disabled={totalGuest >= maxAllowedGuests}
                    onClick={() => {
                      if (totalGuest < maxAllowedGuests) {
                        setChildrenNumber((prev) => prev + 1);
                      }
                    }}
                    className="p-2 border rounded-full border-[#b0b0b0] dark:border-[#666666] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <AiOutlinePlus size={14} className="dark:text-white" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  Max {maxAllowedGuests} guest{maxAllowedGuests > 1 ? "s" : ""} allowed
                </span>
                <button
                  type="button"
                  onClick={() => setShowDropdown(false)}
                  className="underline text-xs text-[#222222] dark:text-white font-semibold px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* reservation button */}
        {!showDropdown && !calendarState && (
          <div className="mt-6 flex justify-center rounded-md">
            <button
              type="button"
              onClick={handleBooking}
              className="capitalize py-3 w-full bg-[#ff385c] hover:bg-[#d90b63] transition duration-200 ease-in text-white font-medium text-sm rounded-md shadow-md cursor-pointer"
            >
              Reserve
            </button>
          </div>
        )}

        {/* calendar & date picker */}
        {calendarState && (
          <div
            ref={calendarRef}
            className="absolute border-b-[1.2px] border-neutral-200 dark:border-neutral-700 shadow-md left-[2px] sm:translate-x-[30%] sm:translate-y-[0%] md:translate-x-[-30%] lg:translate-x-[-20%] xl:translate-x-0 xl:translate-y-0 bg-white dark:bg-[#1e1e1e] rounded-lg overflow-hidden z-[100]"
          >
            <DateRange
              rangeColors={["#262626"]}
              date={new Date()}
              editableDateInputs={true}
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
              ranges={selectedDates}
              disabledDates={disabledDates}
              direction="vertical"
              showDateDisplay={false}
              minDate={new Date()}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ReservationCard;
