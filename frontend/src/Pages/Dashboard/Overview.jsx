import { useMemo } from "react";
import Charts from "../../components/dashboard/Charts";
import DashboardCards from "../../components/dashboard/DashboardCards";
import ProfitLossTrendChart from "../../components/dashboard/ProfitLossTrendChart";
import { useHostData } from "../../hooks/useHostData";
import { removeDuplicates } from "../../hooks/useRemoveDuplicates";
import { FiBarChart2 } from "react-icons/fi";

const Overview = () => {
  const { authorReservations = [], hostHouses = [] } = useHostData();

  // Deduplicate reservations by _id
  const reservations = useMemo(() => {
    return removeDuplicates(authorReservations, "_id");
  }, [authorReservations]);

  return (
    <section className="w-full max-w-[1240px] mx-auto px-3 sm:px-6 md:px-10 xl:px-16 py-5 sm:py-8 md:py-12 space-y-6 sm:space-y-8">
      {/* 4 Dynamic Metric KPI Cards */}
      <DashboardCards
        reservations={reservations}
        housesCount={hostHouses.length}
      />

      {/* 1. Monthly Earnings Bar Chart */}
      <div className="bg-white dark:bg-[#1a1a1a] shadow-sm rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-4 sm:p-7 flex flex-col gap-4 sm:gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-zinc-900 dark:text-white text-lg font-bold flex items-center gap-2">
              <FiBarChart2 className="text-[#ff3f62]" />
              Monthly Earnings Overview
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Net revenue generated across all completed and upcoming stays
            </p>
          </div>
        </div>
        <Charts reservations={reservations} />
      </div>

      {/* 2. Profit & Loss / Revenue Trend Analytics */}
      <ProfitLossTrendChart reservations={reservations} />
    </section>
  );
};

export default Overview;
