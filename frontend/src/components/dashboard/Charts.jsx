 
import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useCurrency } from "../../context/CurrencyContext";
import { convertPrice, formatCurrency, getCurrencySymbol } from "../../utils/currency";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Charts = ({ reservations = [] }) => {
  const { currency: hostCurrency } = useCurrency();
  const currencySymbol = getCurrencySymbol(hostCurrency);

  const [monthlyEarnings, setMonthlyEarnings] = useState(Array(12).fill(0));

  useEffect(() => {
    if (reservations && reservations.length > 0) {
      const currentYear = new Date().getFullYear();
      const updatedEarnings = Array(12).fill(0);

      reservations.forEach((obj) => {
        // Exclude refunded/cancelled bookings from net earnings
        if (obj.status === "refunded" || obj.status === "cancelled") {
          return;
        }

        const checkInDate = obj.checkIn ? new Date(obj.checkIn) : null;
        if (checkInDate && checkInDate.getFullYear() === currentYear) {
          const month = checkInDate.getMonth();
          let earnings = 0;
          if (obj.hostEarnings !== undefined && obj.hostEarnings !== null) {
            if (obj.hostCurrency && obj.hostCurrency !== hostCurrency) {
              earnings = convertPrice(obj.hostEarnings, obj.hostCurrency, hostCurrency);
            } else {
              earnings = Number(obj.hostEarnings) || 0;
            }
          } else {
            const orig = obj.authorEarnedPrice !== undefined ? obj.authorEarnedPrice : (obj.basePrice || 0);
            const resCurrency = obj.currency || obj.hostCurrency || hostCurrency;
            earnings = convertPrice(orig, resCurrency, hostCurrency);
          }
          updatedEarnings[month] += earnings;
        }
      });

      setMonthlyEarnings(updatedEarnings);
    } else {
      setMonthlyEarnings(Array(12).fill(0));
    }
  }, [reservations, hostCurrency]);

  const chartData = useMemo(() => {
    return MONTHS.map((month, index) => ({
      name: month,
      earned: monthlyEarnings[index],
    }));
  }, [monthlyEarnings]);

  const formatYAxis = (value) => {
    if (value >= 1000000) return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
    return `${currencySymbol}${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#1f1f1f] p-3 rounded-xl shadow-lg border border-gray-100 dark:border-[#333333]">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {label} {new Date().getFullYear()}
          </p>
          <p className="text-sm font-bold text-[#ff3f62] dark:text-[#ff5a79] mt-0.5">
            Net Earned: {formatCurrency(payload[0].value, hostCurrency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-[#2a2a2a]" />
          <XAxis
            dataKey="name"
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
          <Bar
            dataKey="earned"
            fill="#ff3f62"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
