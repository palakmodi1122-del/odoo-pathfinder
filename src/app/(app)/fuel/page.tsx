"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Fuel, DollarSign, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultForm = {
  vehicleId: "", tripId: "", liters: 0, costPerLiter: 1.5,
  date: new Date().toISOString().slice(0, 10), odometer: 0, station: "",
};

export default function FuelPage() {
  const store = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [vehicleFilter, setVehicleFilter] = useState("All");

  const totalFuel = store.fuelLogs.reduce((s, f) => s + f.totalCost, 0);
  const totalLiters = store.fuelLogs.reduce((s, f) => s + f.liters, 0);
  const totalMaintenance = store.maintenanceLogs.reduce((s, m) => s + m.cost, 0);

  const filtered = store.fuelLogs
    .filter(f => vehicleFilter === "All" || f.vehicleId === vehicleFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function handleAdd() {
    if (!form.vehicleId || !form.liters || !form.station) return;
    store.addFuelLog({
      ...form,
      totalCost: form.liters * form.costPerLiter,
      tripId: form.tripId || undefined,
    });
    setShowAdd(false);
    setForm(defaultForm);
  }

  // Per-vehicle summary
  const vehicleSummary = store.vehicles
    .filter(v => v.status !== "Retired")
    .map(v => {
      const fuelCost = store.getTotalFuelCostForVehicle(v.id);
      const maintCost = store.getTotalMaintenanceCostForVehicle(v.id);
      const totalCost = fuelCost + maintCost;
      const fuelLiters = store.fuelLogs.filter(f => f.vehicleId === v.id).reduce((s, f) => s + f.liters, 0);
      const completedTripsCount = store.trips.filter(t => t.vehicleId === v.id && t.status === "Completed").length;
      return { v, fuelCost, maintCost, totalCost, fuelLiters, completedTripsCount };
    })
    .filter(s => s.totalCost > 0)
    .sort((a, b) => b.totalCost - a.totalCost);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fuel & Expenses</h1>
          <p className="text-slate-400 text-sm mt-1">Financial tracking per asset</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Log Fuel
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Fuel Cost", value: `$${totalFuel.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/15" },
          { label: "Total Liters", value: `${totalLiters.toLocaleString()} L`, icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-500/15" },
          { label: "Maintenance Cost", value: `$${totalMaintenance.toLocaleString()}`, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/15" },
          { label: "Total Op. Cost", value: `$${(totalFuel + totalMaintenance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Fuel, color: "text-red-400", bg: "bg-red-500/15" },
        ].map(s => (
          <Card key={s.label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs">{s.label}</p>
                  <p className={cn("text-xl font-bold mt-1", s.color)}>{s.value}</p>
                </div>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.bg)}>
                  <s.icon className={cn("w-4 h-4", s.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-Vehicle Cost Summary */}
      {vehicleSummary.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Total Operational Cost by Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["Vehicle", "Fuel Cost", "Maintenance", "Total Op. Cost", "Fuel (L)", "Trips"].map(h => (
                      <th key={h} className="text-left text-xs text-slate-500 font-medium px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {vehicleSummary.map(({ v, fuelCost, maintCost, totalCost, fuelLiters, completedTripsCount }) => (
                    <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-200 text-xs">{v.name}</div>
                        <div className="text-xs text-slate-500">{v.type}</div>
                      </td>
                      <td className="px-5 py-3 text-blue-400 text-xs font-medium">${fuelCost.toFixed(2)}</td>
                      <td className="px-5 py-3 text-amber-400 text-xs font-medium">${maintCost.toLocaleString()}</td>
                      <td className="px-5 py-3 text-red-400 text-xs font-bold">${totalCost.toFixed(2)}</td>
                      <td className="px-5 py-3 text-slate-300 text-xs">{fuelLiters.toFixed(1)} L</td>
                      <td className="px-5 py-3 text-slate-300 text-xs">{completedTripsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fuel Logs */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-white text-base">Fuel Logs</CardTitle>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-44 h-8 bg-slate-800 border-slate-700 text-slate-300 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="All" className="text-slate-300">All Vehicles</SelectItem>
                {store.vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id} className="text-slate-300">{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Vehicle", "Date", "Liters", "Cost/L", "Total", "Odometer", "Station", "Trip"].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(log => {
                  const vehicle = store.vehicles.find(v => v.id === log.vehicleId);
                  const trip = log.tripId ? store.trips.find(t => t.id === log.tripId) : null;
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-200 text-xs">{vehicle?.name ?? "—"}</div>
                        <div className="text-xs text-slate-500">{vehicle?.licensePlate}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{log.date}</td>
                      <td className="px-5 py-3 text-slate-300 text-xs">{log.liters} L</td>
                      <td className="px-5 py-3 text-slate-300 text-xs">${log.costPerLiter.toFixed(2)}</td>
                      <td className="px-5 py-3 text-emerald-400 text-xs font-medium">${log.totalCost.toFixed(2)}</td>
                      <td className="px-5 py-3 text-slate-300 text-xs">{log.odometer.toLocaleString()} km</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{log.station}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{trip ? `${trip.origin}→${trip.destination}` : "—"}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500">No fuel logs</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Fuel Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Fuel Entry</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Vehicle *</Label>
              <Select value={form.vehicleId} onValueChange={v => setForm(f => ({ ...f, vehicleId: v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 h-9">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {store.vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id} className="text-slate-300">{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Link to Trip (optional)</Label>
              <Select value={form.tripId} onValueChange={v => setForm(f => ({ ...f, tripId: v === "_none" ? "" : v }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 h-9">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="_none" className="text-slate-300">None</SelectItem>
                  {store.trips.filter(t => t.vehicleId === form.vehicleId).map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-slate-300">
                      {t.origin}→{t.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Liters *</Label>
              <Input type="number" step="0.1" value={form.liters} onChange={e => setForm(f => ({ ...f, liters: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Cost per Liter ($)</Label>
              <Input type="number" step="0.01" value={form.costPerLiter} onChange={e => setForm(f => ({ ...f, costPerLiter: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Total Cost</Label>
              <div className="h-9 flex items-center px-3 rounded-lg bg-slate-800/50 border border-slate-700 text-emerald-400 text-sm font-medium">
                ${(form.liters * form.costPerLiter).toFixed(2)}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Odometer (km)</Label>
              <Input type="number" value={form.odometer} onChange={e => setForm(f => ({ ...f, odometer: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Station *</Label>
              <Input value={form.station} onChange={e => setForm(f => ({ ...f, station: e.target.value }))} placeholder="Shell Station" className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">Log Fuel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
