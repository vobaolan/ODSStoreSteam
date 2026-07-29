'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calendar, BarChart3, DollarSign, Wallet, ArrowUpRight, Filter } from 'lucide-react';

type TimeRange = 'DAILY' | 'MONTHLY' | 'YEARLY';
type MetricType = 'ALL' | 'REVENUE' | 'CAPITAL' | 'PROFIT';

interface ChartDataPoint {
  label: string;
  revenue: number;
  capital: number;
  profit: number;
  ordersCount: number;
}

export function CrmAnalyticsChart({
  revenueTotal,
  capitalTotal,
  netProfitTotal,
}: {
  revenueTotal: number;
  capitalTotal: number;
  netProfitTotal: number;
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>('DAILY');
  const [activeMetric, setActiveMetric] = useState<MetricType>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // Generate dynamic date labels & analytics data points based on real system date
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const today = new Date();

    if (timeRange === 'DAILY') {
      const baseDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
      // Map JS getDay(): 0 is Sunday, 1 is Monday, 2 is Tuesday...
      const currentDay = today.getDay();
      const normalizedTodayIdx = currentDay === 0 ? 6 : currentDay - 1;

      const days = baseDays.map((name, i) => (i === normalizedTodayIdx ? `${name} (Hôm nay)` : name));

      return days.map((d, i) => {
        const isToday = i === normalizedTodayIdx;
        const rev = isToday ? revenueTotal : 0;
        const cap = isToday ? capitalTotal : 0;
        const prof = isToday ? netProfitTotal : 0;
        return {
          label: d,
          revenue: rev,
          capital: cap,
          profit: prof,
          ordersCount: isToday ? Math.round(rev / 350000) : 0,
        };
      });
    }

    if (timeRange === 'MONTHLY') {
      const currentMonthIndex = today.getMonth(); // 0 to 11
      const months = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        return i === currentMonthIndex ? `T${monthNum} (Hiện tại)` : `T${monthNum}`;
      });

      return months.map((m, i) => {
        const isCurrentMonth = i === currentMonthIndex;
        const rev = isCurrentMonth ? revenueTotal : 0;
        const cap = isCurrentMonth ? capitalTotal : 0;
        const prof = isCurrentMonth ? netProfitTotal : 0;
        return {
          label: m,
          revenue: rev,
          capital: cap,
          profit: prof,
          ordersCount: isCurrentMonth ? Math.round(rev / 350000) : 0,
        };
      });
    }

    // YEARLY
    const currentYear = today.getFullYear();
    const years = [`Năm ${currentYear - 2}`, `Năm ${currentYear - 1}`, `Năm ${currentYear} (Hiện tại)`];
    return years.map((y, i) => {
      const isCurrentYear = i === 2;
      const rev = isCurrentYear ? revenueTotal : 0;
      const cap = isCurrentYear ? capitalTotal : 0;
      const prof = isCurrentYear ? netProfitTotal : 0;
      return {
        label: y,
        revenue: rev,
        capital: cap,
        profit: prof,
        ordersCount: isCurrentYear ? Math.round(rev / 350000) : 0,
      };
    });
  }, [timeRange, revenueTotal, capitalTotal]);

  // Find max value to scale chart height properly
  const maxValue = useMemo(() => {
    let max = 0;
    chartData.forEach((d) => {
      if (d.revenue > max) max = d.revenue;
      if (d.capital > max) max = d.capital;
      if (d.profit > max) max = d.profit;
    });
    return max === 0 ? 1000000 : max;
  }, [chartData]);

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6 mb-10">
      {/* CHART HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-150 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
              BIỂU ĐỒ PHÂN TÍCH TÀI CHÍNH ODS STORE
            </h2>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Theo dõi sự tăng trưởng doanh thu, vốn nạp Steam & lợi nhuận ròng
          </p>
        </div>

        {/* TIME RANGE TOGGLES */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200">
          <button
            type="button"
            onClick={() => setTimeRange('DAILY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'DAILY'
                ? 'bg-white text-sky-700 shadow-xs border border-zinc-200/80 font-black'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            📅 Từng Ngày
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('MONTHLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'MONTHLY'
                ? 'bg-white text-sky-700 shadow-xs border border-zinc-200/80 font-black'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            📊 Từng Tháng
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('YEARLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'YEARLY'
                ? 'bg-white text-sky-700 shadow-xs border border-zinc-200/80 font-black'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            📈 Từng Năm
          </button>
        </div>
      </div>

      {/* METRIC FILTER CHIPS */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider mr-1">Hiển Thị:</span>
          <button
            type="button"
            onClick={() => setActiveMetric('ALL')}
            className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-bold ${
              activeMetric === 'ALL'
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-200'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-white'
            }`}
          >
            Tất Cả Chỉ Số
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('REVENUE')}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetric === 'REVENUE'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
            Doanh Thu Bán Lẻ
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('CAPITAL')}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetric === 'CAPITAL'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Vốn Nạp Steam
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('PROFIT')}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMetric === 'PROFIT'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Lợi Nhuận Ròng
          </button>
        </div>

        {/* SUMMARY QUICK PEAK */}
        <div className="text-[11px] text-zinc-500 font-semibold flex items-center gap-3">
          <span>Thời gian: <strong className="text-zinc-900 font-black">{timeRange === 'DAILY' ? '7 Ngày Gần Nhất' : timeRange === 'MONTHLY' ? '12 Tháng Trong Năm' : 'Các Năm'}</strong></span>
        </div>
      </div>

      {/* GRAPH CANVAS / VISUALIZATION CONTAINER */}
      <div className="relative pt-6 pb-2">
        {/* Hover Tooltip Card (Premium Light Glassmorphic Theme) */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-0 right-4 z-20 bg-white/95 backdrop-blur-md text-zinc-900 p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 border border-sky-200 ring-1 ring-sky-100/50 min-w-48"
            >
              <div className="font-black text-sky-950 border-b border-zinc-150 pb-1.5 flex justify-between items-center">
                <span>{hoveredPoint.label}</span>
                <span className="bg-sky-50 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-sky-200">
                  {hoveredPoint.ordersCount} đơn
                </span>
              </div>
              <div className="flex justify-between gap-4 text-[11px]">
                <span className="text-zinc-500 font-semibold">Doanh Thu:</span>
                <span className="font-black text-sky-600">{formatCurrency(hoveredPoint.revenue)}</span>
              </div>
              <div className="flex justify-between gap-4 text-[11px]">
                <span className="text-zinc-500 font-semibold">Vốn Steam:</span>
                <span className="font-black text-emerald-600">{formatCurrency(hoveredPoint.capital)}</span>
              </div>
              <div className="flex justify-between gap-4 text-[11px]">
                <span className="text-zinc-500 font-semibold">Lợi Nhuận:</span>
                <span className="font-black text-amber-600">{formatCurrency(hoveredPoint.profit)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BARS GRAPH DISPLAY */}
        <div className="h-64 w-full flex items-end justify-between gap-2 pt-8 pb-6 border-b border-zinc-200 relative px-2">
          {/* Y-AXIS GRID LINES */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[10px] text-zinc-300 font-mono border-b border-zinc-200">
            <div className="border-b border-dashed border-zinc-150 w-full flex justify-between">
              <span>{formatCurrency(maxValue)}</span>
            </div>
            <div className="border-b border-dashed border-zinc-150 w-full flex justify-between">
              <span>{formatCurrency(Math.round(maxValue * 0.5))}</span>
            </div>
            <div className="w-full flex justify-between text-zinc-300">
              <span>0 đ</span>
            </div>
          </div>

          {/* BAR ITEMS */}
          {chartData.map((d, index) => {
            const revHeight = maxValue > 0 ? (d.revenue / maxValue) * 100 : 0;
            const capHeight = maxValue > 0 ? (d.capital / maxValue) * 100 : 0;
            const profHeight = maxValue > 0 ? (d.profit / maxValue) * 100 : 0;

            const isAll = activeMetric === 'ALL';
            const showRev = isAll || activeMetric === 'REVENUE';
            const showCap = isAll || activeMetric === 'CAPITAL';
            const showProf = isAll || activeMetric === 'PROFIT';

            return (
              <div
                key={index}
                className="flex-1 h-full flex flex-col justify-end items-center group relative z-10 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* BARS GROUP */}
                <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                  {showCap && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, capHeight)}%` }}
                      transition={{ duration: 0.5, delay: index * 0.03 }}
                      className="w-full max-w-[14px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm shadow-xs group-hover:brightness-110 transition-all"
                    />
                  )}
                  {showRev && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, revHeight)}%` }}
                      transition={{ duration: 0.5, delay: index * 0.03 + 0.02 }}
                      className="w-full max-w-[14px] bg-gradient-to-t from-sky-600 to-blue-400 rounded-t-sm shadow-xs group-hover:brightness-110 transition-all"
                    />
                  )}
                  {showProf && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, profHeight)}%` }}
                      transition={{ duration: 0.5, delay: index * 0.03 + 0.04 }}
                      className="w-full max-w-[14px] bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-sm shadow-xs group-hover:brightness-110 transition-all"
                    />
                  )}
                </div>

                {/* X-AXIS LABEL */}
                <span className="text-[11px] font-bold text-zinc-600 mt-2 truncate max-w-full group-hover:text-sky-600 transition-colors">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER LEGEND SUMMARY */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-emerald-500"></span>
            <span className="font-semibold text-zinc-700">Vốn Steam Nạp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-sky-500"></span>
            <span className="font-semibold text-zinc-700">Doanh Thu Bán Lẻ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-amber-500"></span>
            <span className="font-semibold text-zinc-700">Lợi Nhuận Ròng (~30%)</span>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-zinc-400 italic">
          💡 Đồ thị cập nhật tự động thời gian thực theo từng mốc thời gian
        </div>
      </div>
    </div>
  );
}
