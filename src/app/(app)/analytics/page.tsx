"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  DollarSign, Fuel, Wrench, Users, Truck, TrendingUp,
  Calendar, Filter, Download, BarChart3, PieChart, LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";

type TimeRange = "7d" | "30d" | "90d" | "1y";

export default function AnalyticsPage() {
  const store = useStore();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Comprehensive Analytics Data
  const vehiclePerformanceData = store.vehicles
    .filter(v => v.status !== "Retired")
    .map(vehicle => ({
      name: vehicle.name,
      revenue: store.getTotalRevenueForVehicle(vehicle.id),
      costs: store.getTotalFuelCostForVehicle(vehicle.id) + store.getTotalMaintenanceCostForVehicle(vehicle.id),
      roi: store.getVehicleROI(vehicle.id),
      efficiency: store.getFuelEfficiency(vehicle.id),
      costPerKm: store.getCostPerKm(vehicle.id),
      utilization: store.trips.filter(t => t.vehicleId === vehicle.id && t.status === "Completed").length
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const monthlyRevenueData = [
    { month: "Jan", revenue: 24500, costs: 8200 },
    { month: "Feb", revenue: 32100, costs: 9800 },
    { month: "Mar", revenue: 28700, costs: 8900 },
    { month: "Apr", revenue: 35600, costs: 10200 },
    { month: "May", revenue: 31200, costs: 9100 },
    { month: "Jun", revenue: 38900, costs: 11500 }
  ];

  const driverMetricsData = store.drivers
    .filter(d => d.status !== "Suspended")
    .map(driver => ({
      name: driver.name,
      trips: driver.totalTrips,
      completed: driver.completedTrips,
      safetyScore: driver.safetyScore,
      completionRate: driver.totalTrips > 0 ? (driver.completedTrips / driver.totalTrips) * 100 : 0
    }))
    .sort((a, b) => b.safetyScore - a.safetyScore);

  const maintenanceTrendData = [
    { month: "Jan", maintenance: 12, fuel: 45 },
    { month: "Feb", maintenance: 8, fuel: 52 },
    { month: "Mar", maintenance: 15, fuel: 48 },
    { month: "Apr", maintenance: 6, fuel: 55 },
    { month: "May", maintenance: 11, fuel: 49 },
    { month: "Jun", maintenance: 9, fuel: 51 }
  ];

  const fleetCompositionData = [
    { name: "Trucks", value: store.vehicles.filter(v => v.type === "Truck" && v.status !== "Retired").length, color: "#3b82f6" },
    { name: "Vans", value: store.vehicles.filter(v => v.type === "Van" && v.status !== "Retired").length, color: "#10b981" },
    { name: "Bikes", value: store.vehicles.filter(v => v.type === "Bike" && v.status !== "Retired").length, color: "#f59e0b" }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Summary statistics
  const totalRevenue = vehiclePerformanceData.reduce((sum, v) => sum + v.revenue, 0);
  const totalCosts = vehiclePerformanceData.reduce((sum, v) => sum + v.costs, 0);
  const avgROI = vehiclePerformanceData.length > 0 ? 
    vehiclePerformanceData.reduce((sum, v) => sum + v.roi, 0) / vehiclePerformanceData.length : 0;
  const totalTrips = store.trips.filter(t => t.status === "Completed").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Comprehensive fleet performance insights</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {(["7d", "30d", "90d", "1y"] as TimeRange[]).map(range => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={cn(
                  "h-8 px-3 text-xs",
                  timeRange === range 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-slate-700 text-slate-300 hover:bg-slate-800">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400 mt-1">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">Total Costs</p>
                <p className="text-2xl font-bold text-red-400 mt-1">${totalCosts.toLocaleString()}</p>
              </div>
              <Wrench className="w-8 h-8 text-red-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">Avg ROI</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{avgROI.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium">Completed Trips</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{totalTrips}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costs" 
                    stackId="2" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                    name="Costs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Composition */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              Fleet Composition
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={fleetCompositionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fleetCompositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Performance */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <LineChart className="w-4 h-4 text-purple-400" />
              Vehicle Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={vehiclePerformanceData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                    name="Revenue"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="costs" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#ef4444' }}
                    name="Costs"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="roi" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                    name="ROI %"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Performance Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Driver Performance Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">Driver</th>
                  <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">Total Trips</th>
                  <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">Completed</th>
                  <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">Completion Rate</th>
                  <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">Safety Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {driverMetricsData.map((driver, index) => (
                  <tr key={driver.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-200">{driver.name}</div>
                      <div className="text-xs text-slate-500">#{index + 1} Rank</div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">{driver.trips}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{driver.completed}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-slate-300">{driver.completionRate.toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge 
                        className={cn(
                          "text-xs border",
                          driver.safetyScore >= 90 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                          driver.safetyScore >= 70 ? "bg-blue-500/15 text-blue-400 border-blue-500/30" :
                          "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        )}
                      >
                        {driver.safetyScore}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}