/* eslint-disable react/prop-types */
import Cards from "../../components/dashboard/Cards";
import revenueIcon from "../../assets/basicIcon/dollar.png";
import booking from "../../assets/basicIcon/booking.png";
import house from "../../assets/basicIcon/wallet.png";
import categories from "../../assets/basicIcon/travel.png";

const DashboardCards = ({ reservations, totalPrice }) => {
  // calculate total booking
  const currentDate = new Date(); // Get the current date and time

  const activeBookingReservations = reservations?.filter((obj) => {
    const checkOutDate = new Date(obj.checkOut);
    return checkOutDate > currentDate;
  });

  const activeBooking = activeBookingReservations.length;

  // calculate authors hosted house
  const hostedHouse = reservations?.length;

  // calculate monthly price
  function calculateMonthlyEarnings(obj, currentDate) {
    const checkInDate = new Date(obj.checkIn);
    const checkOutDate = new Date(obj.checkOut);

    // Check if both checkIn and checkOut dates are within the current month
    if (
      checkInDate.getFullYear() === currentDate.getFullYear() &&
      checkInDate.getMonth() === currentDate.getMonth() &&
      checkOutDate.getFullYear() === currentDate.getFullYear() &&
      checkOutDate.getMonth() === currentDate.getMonth()
    ) {
      // Calculate the number of days between checkIn and checkOut
      const numberOfDays = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
      );

      // Calculate the total price for the object for the current month
      const totalPrice = numberOfDays + obj.authorEarnedPrice;

      return totalPrice;
    }

    return 0; // Return 0 for objects outside the current month
  }

  const currentDates = new Date(); // Get the current date

  const totalMonthlyEarnings = reservations?.reduce(
    (accumulator, currentObject) => {
      const objectMonthlyEarnings = calculateMonthlyEarnings(
        currentObject,
        currentDates
      );
      return accumulator + objectMonthlyEarnings;
    },
    0
  );

  console.log(reservations, "reservations data");
  return (
    <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
      <Cards
        title={"Total Revenue"}
        icon={revenueIcon}
        heading={`$${totalPrice}`}
        subHead={"+12% increase"}
      />
      <Cards
        title={"Active Booking"}
        icon={booking}
        heading={`+${activeBooking}`}
        subHead={"+20% increase"}
      />
      <Cards
        title={"Host houses"}
        icon={house}
        heading={`+${hostedHouse}`}
        subHead={"-4% deccrease"}
      />
      <Cards
        title={"Monthly earned"}
        icon={categories}
        heading={`+${totalMonthlyEarnings}`}
        subHead={"-10% deccrease"}
      />
    </div>
  );
};

export default DashboardCards;
