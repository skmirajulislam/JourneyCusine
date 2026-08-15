import { useEffect, useRef, useState } from "react";
import { AiFillStar, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { DateRange } from "react-date-range";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

// date range selector css
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { newReservation } from "../../redux/actions/reservationsActions";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../../backend";
import { parseISO } from "date-fns";
import { useCurrency } from "../../context/CurrencyContext";

/* eslint-disable react/prop-types */
const ReservationCard = ({ listingData }) => {
  // refs
  const calendarRef = useRef();
  const dropdownRef = useRef();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userDetails);

  // handling outside click
  const { state: calendarState, setState: setCalendarState } =
    useOutsideClick(calendarRef);
  const { state: showDropdown, setState: setShowDropdown } =
    useOutsideClick(dropdownRef);

  // guests state is here
  const [guestsNumber, setGuestsNumber] = useState(1);
  const [childrenNumber, setChildrenNumber] = useState(0);
  const [totalGuest, setTotalGuest] = useState(guestsNumber + childrenNumber);
  const [reservations, setReservations] = useState([]);
  // pricing state
  const [reservationBasePrice, setReservationBasePrice] = useState(
    listingData?.basePrice
  );
  const [tax, setTax] = useState(
    listingData?.priceAfterTaxes - listingData?.basePrice
  );
  const [authorEarned, setAuthorEarned] = useState(
    listingData?.authorEarnedPrice
  );

  // dates saving and showing to the dateRange calendar calculation here
  const [selectedDates, setSelectedDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // calculating how many nights guest is staying
  const [nightsStaying, setNightStaying] = useState(1);

  console.log(nightsStaying, typeof nightsStaying, "nights");

  // formatted dates to save in the db
  const formattedStartDate = selectedDates[0]?.startDate?.toISOString();
  const formattedEndDate = selectedDates[0]?.endDate?.toISOString();

  // local dates from fromatted date to show in the ui
  const localStartDate = new Date(formattedStartDate).toLocaleDateString();
  const localEndDate = new Date(formattedEndDate).toLocaleDateString();

  console.log(
    new Date(formattedStartDate).toLocaleDateString(),
    localStartDate,
    localEndDate,
    "dates"
  );
  // Function to handle date selection
  const handleSelect = (ranges) => {
    setSelectedDates([ranges.selection]);
  };

  // booking function
  const orderNumber = localStorage.getItem("orderId");
  const orderId = orderNumber ? orderNumber : 1;
  console.log(orderId);
  const handleBooking = () => {
    if (!user) {
      toast.error("Please log in or sign up to reserve a motel!");
      window.dispatchEvent(new Event("open-auth-popup"));
      return;
    }
    navigate(
      `/book/stays/${listingData._id}?numberOfGuests=${totalGuest}&nightStaying=${nightsStaying}&checkin=${formattedStartDate}&checkout=${formattedEndDate}&orderId=${orderId}`
    );
  };

  // getting saved reservations data
  useEffect(() => {
    (async () => {
      const res = await axios.post(`${API}reservations/get_reservations`, {
        id: listingData?._id,
      });

      if (res.status === 200) {
        setReservations(res.data);
      }
      console.log(res, "reservation data");
    })();
  }, [listingData?._id]);

  // calculation of price for reservations
  // side effects and logic
  useEffect(() => {
    const daysInMiliSec = Math.ceil(
      selectedDates[0]?.endDate - selectedDates[0]?.startDate
    );
    // turning miliseconds into days
    const calculatedNights = daysInMiliSec / (1000 * 60 * 60 * 24);
    const finalNights = calculatedNights === 0 ? 1 : calculatedNights;
    const calculatedBasePrice = listingData?.basePrice * finalNights;
    // tax is 14%
    const calculatingTaxes = Math.round((calculatedBasePrice * 14) / 100);
    // motel service charge is 3%
    const calculateAuthorEarned =
      calculatedBasePrice - Math.round((calculatedBasePrice * 3) / 100);

    // setting states
    setReservationBasePrice(calculatedBasePrice);
    setTax(calculatingTaxes);
    setAuthorEarned(calculateAuthorEarned);
    setNightStaying(calculatedNights);
  }, [selectedDates, listingData?.basePrice]);

  useEffect(() => {
    setTotalGuest(guestsNumber + childrenNumber);
  }, [guestsNumber, childrenNumber]);

  // reservation data
  useEffect(() => {
    const data = {
      listingData,
      formattedStartDate,
      formattedEndDate,
      nightsStaying,
      totalGuest,
      reservationBasePrice,
      tax,
      authorEarned,
    };
    dispatch(newReservation(data));
  }, [
    dispatch,
    listingData,
    formattedStartDate,
    formattedEndDate,
    nightsStaying,
    totalGuest,
    reservationBasePrice,
    tax,
    authorEarned,
  ]);

  // Calculate the disabled date ranges for each object
  const disabledDateRanges = reservations?.map((obj) => ({
    startDate: parseISO(obj.checkIn),
    endDate: parseISO(obj.checkOut),
  }));

  console.log(disabledDateRanges);

  // Generate an array of individual dates within disabledDateRanges
  const disabledDates = disabledDateRanges.reduce((dates, range) => {
    const startDate = new Date(range.startDate);
    const endDate = new Date(range.endDate);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, []);

  const { formatPrice } = useCurrency();

  return (
    <>
      <div className=" w-full min-h-[315px] rounded-xl border border-[#dddddd] dark:border-[#444444] sticky top-32 shadow-customShadow p-6 bg-white dark:bg-[#1e1e1e]">
        <div className=" flex felx-row justify-between items-start">
          <div className=" flex flex-col">
            <h3 className=" text-[22px] text-[#222222] dark:text-white font-semibold">
              {formatPrice(reservationBasePrice)}
            </h3>
            <p className=" text-[#313131] dark:text-[#a0a0a0] text-sm">Total before taxes</p>
          </div>
          <span className=" text-sm text-[#222222] dark:text-[#e5e7eb] flex flex-row gap-1 items-center mt-2">
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
          <div className=" rounded-tl-lg rounded-tr-lg border border-[#b9b9b9] dark:border-[#555555] w-full min-h-[60px] mt-6 relative flex flex-col">
            {/* dates & calendar & guests here */}
            <div>
              <div
                onClick={() => {
                  setCalendarState(true);
                }}
                className=" grid grid-cols-2 cursor-pointer"
              >
                <div className="px-3 py-3">
                  <p className=" text-[10px] text-black dark:text-white font-semibold uppercase">
                    check-in
                  </p>
                  <p className=" text-sm text-[#222222] dark:text-[#e5e7eb]">{localStartDate}</p>
                </div>
                <div className="px-3 py-3 border-l border-[#b9b9b9] dark:border-[#555555]">
                  <p className=" text-[10px] text-black dark:text-white font-semibold uppercase">
                    checkout
                  </p>
                  <p className=" text-sm text-[#222222] dark:text-[#e5e7eb]">{localEndDate}</p>
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
            <div className=" rounded-bl-lg rounded-br-lg border border-[#b9b9b9] dark:border-[#555555] w-full min-h-[50px] cursor-pointer relative">
              {/* guests data */}
              <div className="px-3 py-3 flex flex-row items-center justify-between">
                <div className=" flex flex-col">
                  <p className=" text-[10px] text-black dark:text-white font-semibold uppercase">
                    guests
                  </p>
                  <p className=" text-sm text-[#222222] dark:text-[#e5e7eb]">
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
            <div className=" flex flex-col gap-5">
              <div className=" flex felx-row items-center justify-between">
                {/* adults number here */}
                <span>
                  <p className=" text-base text-[#222222] dark:text-white font-medium">
                    Adults
                  </p>
                  <p className=" text-sm text-[#313131] dark:text-[#a0a0a0]">Age 13+</p>
                </span>
                {/* icons */}
                <span className=" flex flex-row-reverse items-center gap-2">
                  <button
                    onClick={() => {
                      setGuestsNumber((prev) => prev + 1);
                    }}
                    disabled={listingData?.floorPlan?.guests === totalGuest}
                    className={` p-2 rounded-full border border-[#c0c0c0] dark:border-[#777777] opacity-90 disabled:cursor-not-allowed disabled:opacity-20 dark:text-white`}
                  >
                    <AiOutlinePlus size={16} />
                  </button>
                  <p className=" w-[30px] flex justify-center dark:text-white">
                    {guestsNumber}
                  </p>

                  <button
                    onClick={() => {
                      setGuestsNumber((prev) => prev - 1);
                    }}
                    disabled={guestsNumber === 1}
                    className=" p-2 rounded-full border border-[#c0c0c0] dark:border-[#777777] disabled:cursor-not-allowed disabled:opacity-20 dark:text-white"
                  >
                    <AiOutlineMinus size={16} />
                  </button>
                </span>
              </div>
              <div className=" flex felx-row items-center justify-between">
                {/* children number here */}
                <span>
                  <p className=" text-base text-[#222222] dark:text-white font-medium">
                    Children
                  </p>
                  <p className=" text-sm text-[#313131] dark:text-[#a0a0a0]">Ages 2-12</p>
                </span>
                {/* icons */}
                <span className=" flex flex-row-reverse items-center gap-2">
                  <button
                    onClick={() => {
                      setChildrenNumber((prev) => prev + 1);
                    }}
                    disabled={listingData?.floorPlan?.guests === totalGuest}
                    className=" p-2 rounded-full border border-[#c0c0c0] opacity-90 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <AiOutlinePlus size={16} />
                  </button>
                  <p className=" w-[30px] flex justify-center">
                    {childrenNumber}
                  </p>

                  <button
                    onClick={() => {
                      setChildrenNumber((prev) => prev - 1);
                    }}
                    disabled={childrenNumber === 0}
                    className=" p-2 rounded-full border border-[#c0c0c0] disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    <AiOutlineMinus size={16} />
                  </button>
                </span>
              </div>
            </div>
            {/* close btn */}
            <div className=" flex justify-end absolute bottom-3 right-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                }}
                className="underline text-base text-[#222222] dark:text-white font-medium px-3 py-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#333333]"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* reservation button */}
        {!showDropdown && !calendarState && (
          <div className=" mt-6 flex justify-center rounded-md">
            <button
              onClick={() => {
                handleBooking();
              }}
              className="capitalize py-3 w-full bg-[#ff385c] hover:bg-[#d90b63] transition duration-200 ease-in text-white font-medium text-sm rounded-md"
            >
              reserve
            </button>
          </div>
        )}

        {/* calendar & date picker */}
        {!calendarState ? null : (
          <div
            ref={calendarRef}
            className=" absolute border-b-[1.2px] border-neutral-200 dark:border-neutral-700 shadow-md left-[2px] sm:translate-x-[30%] sm:translate-y-[0%] md:translate-x-[-30%] lg:translate-x-[-20%] xl:translate-x-0 xl:translate-y-0 bg-white dark:bg-[#1e1e1e] rounded-lg overflow-hidden"
          >
            <DateRange
              rangeColors={["#262626"]}
              date={new Date()}
              editableDateInputs={true}
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
              ranges={selectedDates}
              disabledDates={disabledDates}
              // isDayBlocked={(date) => isDateDisabled(date)}
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
