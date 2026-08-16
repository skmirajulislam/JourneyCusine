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

/* eslint-disable react/prop-types */
const ReservationCard = ({ listingData }) => {
  // refs
  const calendarRef = useRef();
  const dropdownRef = useRef();

  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  // handling outside click
  const { state: calendarState, setState: setCalendarState } =
    useOutsideClick(calendarRef);
  const { state: showDropdown, setState: setShowDropdown } =
    useOutsideClick(dropdownRef);

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

  const reservationBasePrice = useMemo(() => {
    const base = Number(listingData?.basePrice) || 50;
    return base * nightsStaying;
  }, [listingData?.basePrice, nightsStaying]);

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
    if (!user) {
      toast.error("Please log in or sign up to reserve a motel!");
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }
    const orderNumber = localStorage.getItem("orderId");
    const orderId = orderNumber ? orderNumber : 1;

    navigate(
      `/book/stays/${listingData._id}?numberOfGuests=${totalGuest}&nightStaying=${nightsStaying}&checkin=${formattedStartDate}&checkout=${formattedEndDate}&orderId=${orderId}`
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

  return (
    <>
      <div className="w-full min-h-[315px] rounded-xl border border-[#dddddd] dark:border-[#444444] sticky top-32 shadow-customShadow p-6 bg-white dark:bg-[#1e1e1e]">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col">
            <h3 className="text-[22px] text-[#222222] dark:text-white font-semibold">
              {formatPrice(reservationBasePrice)}
            </h3>
            <p className="text-[#313131] dark:text-[#a0a0a0] text-sm">Total before taxes</p>
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

        {/* guests data dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="min-h-[200px] w-72 shadow-lg border dark:border-[#444444] absolute z-[90] bg-white dark:bg-[#2a2a2a] px-4 py-5 rounded-md"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <h4 className="text-base text-[#222222] dark:text-white font-medium">Adults</h4>
                  <p className="text-xs text-[#717171] dark:text-[#a0a0a0]">Age 13+</p>
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <button
                    disabled={guestsNumber === 1}
                    onClick={() => setGuestsNumber((prev) => prev - 1)}
                    className="p-2 border rounded-full border-[#b0b0b0] dark:border-[#666666] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <AiOutlineMinus size={14} className="dark:text-white" />
                  </button>
                  <span className="text-sm dark:text-white">{guestsNumber}</span>
                  <button
                    disabled={guestsNumber === 10}
                    onClick={() => setGuestsNumber((prev) => prev + 1)}
                    className="p-2 border rounded-full border-[#b0b0b0] dark:border-[#666666] disabled:opacity-30 disabled:cursor-not-allowed"
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
                    disabled={childrenNumber === 0}
                    onClick={() => setChildrenNumber((prev) => prev - 1)}
                    className="p-2 border rounded-full border-[#b0b0b0] dark:border-[#666666] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <AiOutlineMinus size={14} className="dark:text-white" />
                  </button>
                  <span className="text-sm dark:text-white">{childrenNumber}</span>
                  <button
                    disabled={childrenNumber === 5}
                    onClick={() => setChildrenNumber((prev) => prev + 1)}
                    className="p-2 border rounded-full border-[#b0b0b0] dark:border-[#666666] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <AiOutlinePlus size={14} className="dark:text-white" />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDropdown(false)}
                  className="underline text-sm text-[#222222] dark:text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
