"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck, Users, Package, AlertTriangle, Activity, TrendingUp,
  CheckCircle, Clock, XCircle, MapPin, Wrench, Fuel, DollarSign,
  BarChart3, PieChart, LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";

// Recharts components
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
  Cell
} from "recharts";

type FilterType = "All" | "Truck" | "Van" | "Bike";
type StatusFilter = "All" | "Available" | "On Trip" | "In Shop" | "Retired";

const STATUS_COLORS: Record<string, string> = {
  Available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "On Trip": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "In Shop": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Retired: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  Dispatched: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Draft: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function DashboardPage() {
  const store = useStore();
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  // Analytics Data Preparation
  const revenueData = store.vehicles.map(vehicle => ({
    name: vehicle.name,
    revenue: store.getTotalRevenueForVehicle(vehicle.id),
    costs: store.getTotalFuelCostForVehicle(vehicle.id) + store.getTotalMaintenanceCostForVehicle(vehicle.id),
    roi: store.getVehicleROI(vehicle.id)
  })).filter(item => item.revenue > 0 || item.costs > 0);

  const fuelEfficiencyData = store.vehicles
    .filter(v => v.status !== "Retired")
    .map(vehicle => ({
      name: vehicle.name,
      efficiency: store.getFuelEfficiency(vehicle.id),
      costPerKm: store.getCostPerKm(vehicle.id)
    }))
    .filter(item => item.efficiency > 0);

  const maintenanceData = store.vehicles
    .filter(v => v.status !== "Retired")
    .map(vehicle => ({
      name: vehicle.name,
      maintenanceCost: store.getTotalMaintenanceCostForVehicle(vehicle.id),
      fuelCost: store.getTotalFuelCostForVehicle(vehicle.id)
    }))
    .filter(item => item.maintenanceCost > 0 || item.fuelCost > 0);

  const vehicleTypeData = [
    { name: "Trucks", value: store.vehicles.filter(v => v.type === "Truck" && v.status !== "Retired").length },
    { name: "Vans", value: store.vehicles.filter(v => v.type === "Van" && v.status !== "Retired").length },
    { name: "Bikes", value: store.vehicles.filter(v => v.type === "Bike" && v.status !== "Retired").length }
  ];

  const driverPerformanceData = store.drivers
    .filter(d => d.status !== "Suspended")
    .map(driver => ({
      name: driver.name.split(' ')[0], // First name only for cleaner display
      trips: driver.totalTrips,
      completed: driver.completedTrips,
      safetyScore: driver.safetyScore
    }))
    .sort((a, b) => b.trips - a.trips)
    .slice(0, 5);

  const filteredVehicles = store.vehicles.filter(v => {
    if (typeFilter !== "All" && v.type !== typeFilter) return false;
    if (statusFilter !== "All" && v.status !== statusFilter) return false;
    return true;
  });

  const activeFleet = store.vehicles.filter(v => v.status === "On Trip").length;
  const inShop = store.vehicles.filter(v => v.status === "In Shop").length;
  const available = store.vehicles.filter(v => v.status === "Available").length;
  const total = store.vehicles.filter(v => v.status !== "Retired").length;
  const utilizationRate = total > 0 ? Math.round((activeFleet / total) * 100) : 0;
  const pendingCargo = store.trips.filter(t => t.status === "Draft").length;
  const expiredLicenses = store.drivers.filter(d => new Date(d.licenseExpiry) < new Date()).length;

  const recentTrips = [...store.trips]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Command Center</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time fleet overview and status monitoring</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Active Fleet</p>
                <p className="text-3xl font-bold text-white mt-1">{activeFleet}</p>
                <p className="text-slate-500 text-xs mt-1">vehicles on trip</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Maintenance</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{inShop}</p>
                <p className="text-slate-500 text-xs mt-1">vehicles in shop</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Utilization</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">{utilizationRate}%</p>
                <p className="text-slate-500 text-xs mt-1">{available} idle / {total} active fleet</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Pending Cargo</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">{pendingCargo}</p>
                <p className="text-slate-500 text-xs mt-1">awaiting dispatch</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Bar */}
      {(inShop > 0 || expiredLicenses > 0) && (
        <div className="flex flex-wrap gap-3">
          {inShop > 0 && (
            <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-800/50 text-amber-400 text-sm px-4 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              {inShop} vehicle{inShop > 1 ? "s" : ""} currently in maintenance
            </div>
          )}
          {expiredLicenses > 0 && (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 text-red-400 text-sm px-4 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              {expiredLicenses} driver license{expiredLicenses > 1 ? "s" : ""} expired
            </div>
          )}
        </div>
      )}

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analytics */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Revenue vs Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {revenueData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    <Bar dataKey="costs" fill="#ef4444" name="Costs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fuel Efficiency */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Fuel className="w-4 h-4 text-blue-400" />
              Fuel Efficiency (km/L)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {fuelEfficiencyData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={fuelEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                      name="Efficiency (km/L)"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                No fuel efficiency data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Costs */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Maintenance vs Fuel Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {maintenanceData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maintenanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Bar dataKey="maintenanceCost" fill="#f59e0b" name="Maintenance" />
                    <Bar dataKey="fuelCost" fill="#8b5cf6" name="Fuel" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                No maintenance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Type Distribution */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              Fleet Composition
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {vehicleTypeData.some(item => item.value > 0) ? (
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={vehicleTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vehicleTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                No vehicle data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Driver Performance Chart */}
      {driverPerformanceData.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Top Driver Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driverPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar yAxisId="left" dataKey="trips" fill="#3b82f6" name="Total Trips" />
                  <Bar yAxisId="left" dataKey="completed" fill="#10b981" name="Completed Trips" />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="safetyScore" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#f59e0b' }}
                    name="Safety Score"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vehicle Status Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-white text-base">Fleet Status</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {/* Type Filters */}
                  <div className="flex gap-1">
                    {(["All", "Truck", "Van", "Bike"] as FilterType[]).map(f => (
                      <Button
                        key={f}
                        variant={typeFilter === f ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setTypeFilter(f)}
                        className={cn(
                          "h-7 px-3 text-xs",
                          typeFilter === f ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-400 hover:text-white"
                        )}
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                  {/* Status Filters */}
                  <div className="flex gap-1">
                    {(["All", "Available", "On Trip", "In Shop"] as StatusFilter[]).map(f => (
                      <Button
                        key={f}
                        variant={statusFilter === f ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter(f)}
                        className={cn(
                          "h-7 px-3 text-xs",
                          statusFilter === f ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white"
                        )}
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">Vehicle</th>
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Type</th>
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Region</th>
                      <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">Odometer</th>
                      <th className="text-left text-xs text-slate-500 font-medium px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredVehicles.map(v => (
                      <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3">
                          <div className="font-medium text-slate-200">{v.name}</div>
                          <div className="text-xs text-slate-500">{v.licensePlate}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-400 text-xs">{v.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-400 text-xs">{v.region}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-slate-300 text-xs">{v.odometer.toLocaleString()} km</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("text-xs border", STATUS_COLORS[v.status])}>
                            {v.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredVehicles.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                          No vehicles match current filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Fleet Breakdown */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Fleet Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Available", count: available, color: "bg-emerald-500", icon: CheckCircle, iconColor: "text-emerald-400" },
                { label: "On Trip", count: activeFleet, color: "bg-blue-500", icon: MapPin, iconColor: "text-blue-400" },
                { label: "In Shop", count: inShop, color: "bg-amber-500", icon: Wrench, iconColor: "text-amber-400" },
                { label: "Retired", count: store.vehicles.filter(v => v.status === "Retired").length, color: "bg-slate-500", icon: XCircle, iconColor: "text-slate-400" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className={cn("w-4 h-4 shrink-0", item.iconColor)} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-400">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", item.color)}
                        style={{ width: `${store.vehicles.length ? (item.count / store.vehicles.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Trips */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Recent Trips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {recentTrips.map(trip => {
                const vehicle = store.vehicles.find(v => v.id === trip.vehicleId);
                const driver = store.drivers.find(d => d.id === trip.driverId);
                return (
                  <div key={trip.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate">
                        {trip.origin} → {trip.destination}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{vehicle?.name} · {driver?.name}</div>
                    </div>
                    <Badge className={cn("text-xs border shrink-0", STATUS_COLORS[trip.status])}>
                      {trip.status}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Driver Summary */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Driver Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              {[
                { label: "On Duty / On Trip", count: store.drivers.filter(d => d.status === "On Trip" || d.status === "On Duty").length, color: "text-blue-400" },
                { label: "Off Duty", count: store.drivers.filter(d => d.status === "Off Duty").length, color: "text-slate-400" },
                { label: "Suspended", count: store.drivers.filter(d => d.status === "Suspended").length, color: "text-red-400" },
                { label: "Expired License", count: expiredLicenses, color: "text-orange-400" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 text-xs">{item.label}</span>
                  <span className={cn("font-medium text-sm", item.color)}>{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
