import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import Charts from "../../components/dashboard/Charts";
import DashboardCards from "../../components/dashboard/DashboardCards";
import ProfitLossTrendChart from "../../components/dashboard/ProfitLossTrendChart";
import { getAuthorReservations } from "../../redux/actions/reservationsActions";
import { removeDuplicates } from "../../hooks/useRemoveDuplicates";
import api from "../../backend";
import { FiBarChart2 } from "react-icons/fi";

const Overview = () => {
  const listingReservations = useSelector(
    (state) => state.reservations.authorReservations || []
  );
  const [authorHouses, setAuthorHouses] = useState([]);
  const dispatch = useDispatch();

  // Load host reservations
  useEffect(() => {
    dispatch(getAuthorReservations());
  }, [dispatch]);

  // Load host published listings
  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await api.get("/house/get_author_houses");
        if (res.data?.houses) {
          setAuthorHouses(res.data.houses);
        } else if (Array.isArray(res.data)) {
          setAuthorHouses(res.data);
        }
      } catch (err) {
        console.error("Error fetching author houses for overview:", err);
      }
    };
    fetchHouses();
  }, []);

  // Deduplicate reservations by _id
  const reservations = useMemo(() => {
    return removeDuplicates(listingReservations, "_id");
  }, [listingReservations]);

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-8 md:px-10 xl:px-16 py-8 md:py-12 space-y-8">
      {/* 4 Dynamic Metric KPI Cards */}
      <DashboardCards
        reservations={reservations}
        housesCount={authorHouses.length}
      />

      {/* 1. Monthly Earnings Bar Chart */}
      <div className="bg-white dark:bg-[#1a1a1a] shadow-sm rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-6 sm:p-7 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-zinc-900 dark:text-white text-lg font-bold flex items-center gap-2">
              <FiBarChart2 className="text-[#ff3f62]" />
              Monthly Earnings Overview
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Net revenue generated per month (excluding refunded bookings).
            </p>
          </div>
        </div>
        <Charts reservations={reservations} />
      </div>

      {/* 2. Profit & Loss Trend Analysis Chart */}
      <ProfitLossTrendChart reservations={reservations} />
    </section>
  );
};

export default Overview;
