import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { dashboardService } from "../services/dashboard.service";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

const Dashboard = () => {
  // Fetch dashboard stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });

  if (statsLoading) {
    return <Loading fullScreen />;
  }

  if (statsError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load dashboard"
        description="Unable to fetch dashboard statistics. Please try again later."
      />
    );
  }

  const statsData = stats?.data || {};
  const stockTrendData = statsData.stockMovements || [];
  const hasMovementData = stockTrendData.some(
    (entry) =>
      entry.receipts ||
      entry.deliveries ||
      entry.internalTransfers ||
      entry.adjustments
  );
  const recentOperations = statsData.recentOperations || [];
  return (
    <div className="p-2 md:p-10 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of your inventory performance.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={statsData.totalProducts || 0}
          trend={`${statsData.totalProducts || 0} items`}
          isPositive={true}
          icon={Package}
          color="indigo"
        />
        <StatCard
          title="Low Stock Items"
          value={statsData.lowStockItems ?? statsData.lowStockCount ?? 0}
          trend="Needs attention"
          isPositive={false}
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Pending Receipts"
          value={statsData.pendingReceipts || 0}
          trend="Incoming"
          isPositive={true}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Pending Deliveries"
          value={statsData.pendingDeliveries || 0}
          trend="Outgoing"
          isPositive={true}
          icon={TrendingDown}
          color="orange"
        />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            Stock Movement Trends
          </h3>
          {hasMovementData ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={stockTrendData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorReceipts"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorDeliveries"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} domain={[0, "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="internalTransfers"
                  stroke="#6366f1"
                  fillOpacity={0.15}
                  fill="#6366f1"
                  name="Transfers"
                />
                <Area
                  type="monotone"
                  dataKey="receipts"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorReceipts)"
                  name="Receipts"
                />
                <Area
                  type="monotone"
                  dataKey="deliveries"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorDeliveries)"
                  name="Deliveries"
                />
                <Area
                  type="monotone"
                  dataKey="adjustments"
                  stroke="#f59e0b"
                  fillOpacity={0.2}
                  fill="#f59e0b"
                  name="Adjustments"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center text-slate-400 dark:text-slate-600">
              <p className="text-sm">
                No stock movement data for the selected period
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-6">
            {recentOperations.length > 0 ? (
              recentOperations.map((operation, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0 ring-4 ring-indigo-100 dark:ring-indigo-900"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {operation.type} Operation
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {operation.reference || "No reference"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(operation.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-600 text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, isPositive, icon: Icon, color }) => {
  const colors = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    orange:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            isPositive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {trend}
        </span>
      </div>
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
        {title}
      </h3>
      <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
        {value}
      </p>
    </motion.div>
  );
};

export default Dashboard;
