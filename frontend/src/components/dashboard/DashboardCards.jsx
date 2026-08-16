 
import Cards from "../../components/dashboard/Cards";
import revenueIcon from "../../assets/basicIcon/dollar.png";
import booking from "../../assets/basicIcon/booking.png";
import house from "../../assets/basicIcon/wallet.png";
import categories from "../../assets/basicIcon/travel.png";
import { useCurrency } from "../../context/CurrencyContext";
import { convertPrice, formatCurrency } from "../../utils/currency";

const DashboardCards = ({ reservations = [], housesCount = 0 }) => {
  const { currency: hostCurrency } = useCurrency();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Helper to extract net earnings for a single reservation in host currency
  const getNetEarnings = (res) => {
    if (
      res.status === "refunded" ||
      res.status === "cancelled"
    ) {
      return 0; // Refunded reservations contribute 0 to net host earnings
    }

    if (res.hostEarnings && res.hostCurrency === hostCurrency) {
      return res.hostEarnings;
    }

    const usdPrice = res.authorEarnedPrice || res.basePrice || 0;
    return convertPrice(usdPrice, "USD", hostCurrency);
  };

  // 1. Total Net Revenue
  const totalRevenue = reservations.reduce(
    (sum, r) => sum + getNetEarnings(r),
    0
  );

  // 2. Active Bookings (Confirmed ongoing & future stays where checkout is today or later)
  const activeBookings = reservations.filter((r) => {
    if (
      r.status === "refunded" ||
      r.status === "cancelled" ||
      r.status === "cancellation_requested"
    ) {
      return false;
    }
    const outDate = new Date(r.checkOut || r.checkIn || Date.now());
    outDate.setHours(23, 59, 59, 999);
    return outDate >= startOfToday;
  }).length;

  // Previous month confirmed bookings
  const prevMonthActiveBookings = reservations.filter((r) => {
    if (
      r.status === "refunded" ||
      r.status === "cancelled" ||
      r.status === "cancellation_requested"
    ) {
      return false;
    }
    const inDate = r.checkIn ? new Date(r.checkIn) : null;
    return (
      inDate &&
      inDate.getFullYear() === prevYear &&
      inDate.getMonth() === prevMonth
    );
  }).length;

  // 3. Current Month vs Previous Month Earnings
  const currentMonthEarnings = reservations.reduce((sum, r) => {
    const inDate = r.checkIn ? new Date(r.checkIn) : null;
    if (
      inDate &&
      inDate.getFullYear() === currentYear &&
      inDate.getMonth() === currentMonth
    ) {
      return sum + getNetEarnings(r);
    }
    return sum;
  }, 0);

  const prevMonthEarnings = reservations.reduce((sum, r) => {
    const inDate = r.checkIn ? new Date(r.checkIn) : null;
    if (
      inDate &&
      inDate.getFullYear() === prevYear &&
      inDate.getMonth() === prevMonth
    ) {
      return sum + getNetEarnings(r);
    }
    return sum;
  }, 0);

  // Helper for computing percentage delta
  const computeDelta = (current, previous) => {
    if (previous === 0) {
      if (current === 0) return { delta: "0.0%", isPositive: true, isNeutral: true };
      return { delta: "+100%", isPositive: true, isNeutral: false };
    }
    const diff = ((current - previous) / previous) * 100;
    const isPositive = diff >= 0;
    return {
      delta: `${isPositive ? "+" : ""}${diff.toFixed(1)}%`,
      isPositive,
      isNeutral: Math.abs(diff) < 0.1,
    };
  };

  const revenueDelta = computeDelta(currentMonthEarnings, prevMonthEarnings);
  const bookingDelta = computeDelta(activeBookings, prevMonthActiveBookings);
  const monthlyDelta = computeDelta(currentMonthEarnings, prevMonthEarnings);

  const displayHousesCount = housesCount > 0 ? housesCount : reservations.length > 0 ? 1 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 1. Total Revenue */}
      <Cards
        title="Total Revenue"
        icon={revenueIcon}
        heading={formatCurrency(totalRevenue, hostCurrency)}
        delta={revenueDelta.delta}
        isPositive={revenueDelta.isPositive}
        isNeutral={revenueDelta.isNeutral}
        subHead="vs last month"
      />

      {/* 2. Active Bookings */}
      <Cards
        title="Active Bookings"
        icon={booking}
        heading={`+${activeBookings}`}
        delta={bookingDelta.delta}
        isPositive={bookingDelta.isPositive}
        isNeutral={bookingDelta.isNeutral}
        subHead="vs last month"
      />

      {/* 3. Host Houses */}
      <Cards
        title="Host Houses"
        icon={house}
        heading={`+${displayHousesCount}`}
        delta={`${displayHousesCount} Active`}
        isPositive={true}
        isNeutral={false}
      />

      {/* 4. Monthly Earned */}
      <Cards
        title="Monthly Earned"
        icon={categories}
        heading={formatCurrency(currentMonthEarnings, hostCurrency)}
        delta={monthlyDelta.delta}
        isPositive={monthlyDelta.isPositive}
        isNeutral={monthlyDelta.isNeutral}
        subHead="vs last month"
      />
    </div>
  );
};

export default DashboardCards;
