/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCurrency } from "../../context/CurrencyContext";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const ProfitLossTrendChart = ({ reservations = [] }) => {
  const { currency: hostCurrency } = useCurrency();
  const currencySymbol = getCurrencySymbol(hostCurrency);

  const [timeframe, setTimeframe] = useState("year"); // "year" | "6months"

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Helper to convert any USD or native price to host currency
  const toHostCur = (amountUSD, nativeAmount, nativeCur) => {
    if (nativeAmount !== undefined && nativeCur === hostCurrency) {
      return nativeAmount;
    }
    return convertPrice(amountUSD || 0, "USD", hostCurrency);
  };

  // Build monthly data for Gross Revenue, Refunds, and Net Profit
  const trendData = useMemo(() => {
    const data = months.map((monthName, idx) => ({
      month: monthName,
      monthIndex: idx,
      grossRevenue: 0,
      refunds: 0,
      netProfit: 0,
      bookingsCount: 0,
      refundsCount: 0,
    }));

    reservations.forEach((r) => {
      const resDate = r.checkIn ? new Date(r.checkIn) : r.created_at ? new Date(r.created_at) : null;
      if (!resDate || resDate.getFullYear() !== currentYear) return;

      const mIdx = resDate.getMonth();
      if (mIdx < 0 || mIdx > 11) return;

      const gross = toHostCur(r.authorEarnedPrice || r.totalPrice, r.hostEarnings, r.hostCurrency);
      data[mIdx].grossRevenue += gross;
      data[mIdx].bookingsCount += 1;

      if (r.status === "refunded" || r.status === "cancelled") {
        // Refunded booking
        const refundAmt = r.refundDetails?.refundAmount
          ? toHostCur(r.refundDetails.refundAmount, r.refundDetails.refundAmount, r.refundDetails.refundCurrency || hostCurrency)
          : gross;
        data[mIdx].refunds += refundAmt;
        data[mIdx].refundsCount += 1;
      } else {
        // Confirmed net profit
        data[mIdx].netProfit += gross;
      }
    });

    if (timeframe === "6months") {
      const startIdx = Math.max(0, currentMonth - 5);
      return data.slice(startIdx, currentMonth + 1);
    }

    return data;
  }, [reservations, hostCurrency, currentYear, currentMonth, timeframe]);

  // Summary Totals
  const totals = useMemo(() => {
    const totalGross = trendData.reduce((acc, d) => acc + d.grossRevenue, 0);
    const totalRefunds = trendData.reduce((acc, d) => acc + d.refunds, 0);
    const totalNet = trendData.reduce((acc, d) => acc + d.netProfit, 0);
    const margin = totalGross > 0 ? ((totalNet / totalGross) * 100).toFixed(1) : "100.0";

    return {
      totalGross,
      totalRefunds,
      totalNet,
      margin,
    };
  }, [trendData]);

  const formatYAxis = (value) => {
    if (value >= 1000000) return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
    return `${currencySymbol}${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const gross = payload.find((p) => p.dataKey === "grossRevenue")?.value || 0;
      const refunds = payload.find((p) => p.dataKey === "refunds")?.value || 0;
      const net = payload.find((p) => p.dataKey === "netProfit")?.value || 0;

      return (
        <div className="bg-white dark:bg-[#1e1e1e] p-3.5 rounded-xl shadow-xl border border-gray-100 dark:border-[#333333] min-w-[200px]">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-100 dark:border-[#2d2d2d] pb-1">
            {label} {currentYear} Breakdown
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400 font-medium">
              <span>Gross Bookings:</span>
              <span className="font-bold">{formatCurrency(gross, hostCurrency)}</span>
            </div>
            <div className="flex justify-between items-center text-rose-500 dark:text-rose-400 font-medium">
              <span>Refunds Issued:</span>
              <span className="font-bold">-{formatCurrency(refunds, hostCurrency)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold border-t border-gray-100 dark:border-[#2d2d2d] pt-1 mt-1">
              <span>Net Host Profit:</span>
              <span>{formatCurrency(net, hostCurrency)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] shadow-sm rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-6 sm:p-7 flex flex-col gap-6">
      {/* Header with Title & Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-zinc-900 dark:text-white text-lg font-bold flex items-center gap-2">
            <FiTrendingUp className="text-emerald-500" />
            Profit & Loss Trend Analysis
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Track gross bookings, guest refunds, and net revenue trajectory across months.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-[#252525] p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe("year")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              timeframe === "year"
                ? "bg-white dark:bg-[#333333] text-zinc-900 dark:text-white shadow-xs"
                : "text-gray-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Full Year {currentYear}
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("6months")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              timeframe === "6months"
                ? "bg-white dark:bg-[#333333] text-zinc-900 dark:text-white shadow-xs"
                : "text-gray-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Last 6 Months
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-neutral-50 dark:bg-[#222222] p-3.5 rounded-xl border border-gray-100 dark:border-[#2d2d2d]">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Gross Bookings
          </span>
          <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(totals.totalGross, hostCurrency)}
          </span>
        </div>

        <div className="bg-neutral-50 dark:bg-[#222222] p-3.5 rounded-xl border border-gray-100 dark:border-[#2d2d2d]">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Refunds & Deductions
          </span>
          <span className="text-base sm:text-lg font-bold text-rose-500 dark:text-rose-400 mt-1 block">
            -{formatCurrency(totals.totalRefunds, hostCurrency)}
          </span>
        </div>

        <div className="bg-neutral-50 dark:bg-[#222222] p-3.5 rounded-xl border border-gray-100 dark:border-[#2d2d2d]">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Net Profit Earned
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(totals.totalNet, hostCurrency)}
          </span>
        </div>

        <div className="bg-neutral-50 dark:bg-[#222222] p-3.5 rounded-xl border border-gray-100 dark:border-[#2d2d2d]">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
            Profit Retention
          </span>
          <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mt-1 block">
            {totals.margin}%
          </span>
        </div>
      </div>

      {/* Recharts Area / Trend Plot */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorRefund" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-[#2a2a2a]" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#888888", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#888888", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 15, fontSize: "12px" }}
            />

            {/* Gross Bookings */}
            <Area
              type="monotone"
              name="Gross Bookings"
              dataKey="grossRevenue"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorGross)"
            />

            {/* Refunds Issued */}
            <Area
              type="monotone"
              name="Refunds Issued"
              dataKey="refunds"
              stroke="#f43f5e"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorRefund)"
            />

            {/* Net Host Profit */}
            <Area
              type="monotone"
              name="Net Host Profit"
              dataKey="netProfit"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorNet)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitLossTrendChart;
