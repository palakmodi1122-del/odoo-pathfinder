"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MapPin, CheckCircle, XCircle, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Trip } from "@/lib/store";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Dispatched: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

const defaultForm = {
  vehicleId: "", driverId: "", origin: "", destination: "",
  cargoWeight: 0, cargoDescription: "", revenue: 0, notes: "",
};

export default function TripsPage() {
  const store = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [completeTrip, setCompleteTrip] = useState<Trip | null>(null);
  const [finalOdometer, setFinalOdometer] = useState(0);

  const availableVehicles = store.vehicles.filter(v => v.status === "Available");
  const availableDrivers = store.drivers.filter(d => d.status === "Off Duty");

  const filtered = store.trips.filter(t => statusFilter === "All" || t.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedVehicle = store.vehicles.find(v => v.id === form.vehicleId);
  const selectedDriver = store.drivers.find(d => d.id === form.driverId);

  function handleCreate() {
    setFormError("");
    if (!form.vehicleId || !form.driverId || !form.origin || !form.destination) {
      setFormError("Please fill all required fields.");
      return;
    }
    const result = store.createTrip({ ...form });
    if (!result.success) {
      setFormError(result.error || "Failed to create trip.");
      return;
    }
    setShowCreate(false);
    setForm(defaultForm);
  }

  function handleDispatch(tripId: string) { store.dispatchTrip(tripId); }
  function handleCancel(tripId: string) { store.cancelTrip(tripId); }
  function handleComplete() {
    if (!completeTrip) return;
    store.completeTrip(completeTrip.id, finalOdometer);
    setCompleteTrip(null);
  }

  const stats = {
    total: store.trips.length,
    draft: store.trips.filter(t => t.status === "Draft").length,
    dispatched: store.trips.filter(t => t.status === "Dispatched").length,
    completed: store.trips.filter(t => t.status === "Completed").length,
    cancelled: store.trips.filter(t => t.status === "Cancelled").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Trip Dispatcher</h1>
          <p className="text-slate-400 text-sm mt-1">Create and manage delivery trips</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> New Trip
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", count: stats.total, color: "text-white" },
          { label: "Draft", count: stats.draft, color: "text-purple-400" },
          { label: "Dispatched", count: stats.dispatched, color: "text-blue-400" },
          { label: "Completed", count: stats.completed, color: "text-emerald-400" },
          { label: "Cancelled", count: stats.cancelled, color: "text-red-400" },
        ].map(s => (
          <Card key={s.label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className={cn("text-2xl font-bold", s.color)}>{s.count}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Draft", "Dispatched", "Completed", "Cancelled"].map(s => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "h-8 px-4 text-xs",
              statusFilter === s ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Trip Cards */}
      <div className="space-y-3">
        {sorted.map(trip => {
          const vehicle = store.vehicles.find(v => v.id === trip.vehicleId);
          const driver = store.drivers.find(d => d.id === trip.driverId);
          const capacityPct = vehicle ? Math.round((trip.cargoWeight / vehicle.maxCapacity) * 100) : 0;
          return (
            <Card key={trip.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  {/* Route */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("text-xs border", STATUS_COLORS[trip.status])}>{trip.status}</Badge>
                      <span className="text-xs text-slate-500">#{trip.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-200 font-medium truncate">{trip.origin}</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-slate-200 font-medium truncate">{trip.destination}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                      <span>Vehicle: <span className="text-slate-300">{vehicle?.name ?? "—"}</span></span>
                      <span>Driver: <span className="text-slate-300">{driver?.name ?? "—"}</span></span>
                      <span>Cargo: <span className="text-slate-300">{trip.cargoWeight.toLocaleString()} kg</span></span>
                      {trip.revenue > 0 && <span>Revenue: <span className="text-emerald-400">${trip.revenue.toLocaleString()}</span></span>}
                      {trip.distanceKm && <span>Distance: <span className="text-slate-300">{trip.distanceKm} km</span></span>}
                    </div>
                    {vehicle && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[120px]">
                          <div
                            className={cn("h-full rounded-full transition-all", capacityPct > 90 ? "bg-red-500" : capacityPct > 70 ? "bg-amber-500" : "bg-emerald-500")}
                            style={{ width: `${Math.min(capacityPct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{capacityPct}% capacity</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {trip.status === "Draft" && (
                      <>
                        <Button size="sm" onClick={() => handleDispatch(trip.id)} className="h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs">
                          <Send className="w-3.5 h-3.5" /> Dispatch
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleCancel(trip.id)} className="h-8 text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-1.5 text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </Button>
                      </>
                    )}
                    {trip.status === "Dispatched" && (
                      <>
                        <Button size="sm" onClick={() => { setCompleteTrip(trip); setFinalOdometer((vehicle?.odometer ?? 0) + 100); }} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Complete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleCancel(trip.id)} className="h-8 text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-1.5 text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {sorted.length === 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center text-slate-500">No trips found</CardContent>
          </Card>
        )}
      </div>

      {/* Create Trip Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Vehicle *</Label>
                <Select value={form.vehicleId} onValueChange={v => setForm(f => ({ ...f, vehicleId: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 h-9">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {availableVehicles.length === 0 && <SelectItem value="none" disabled className="text-slate-500">No available vehicles</SelectItem>}
                    {availableVehicles.map(v => (
                      <SelectItem key={v.id} value={v.id} className="text-slate-300">
                        {v.name} ({v.maxCapacity.toLocaleString()}kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Driver *</Label>
                <Select value={form.driverId} onValueChange={v => setForm(f => ({ ...f, driverId: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 h-9">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {availableDrivers.length === 0 && <SelectItem value="none" disabled className="text-slate-500">No available drivers</SelectItem>}
                    {availableDrivers.map(d => {
                      const expired = new Date(d.licenseExpiry) < new Date();
                      return (
                        <SelectItem key={d.id} value={d.id} className="text-slate-300">
                          {d.name} {expired ? "⚠️ Expired" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedVehicle && selectedDriver && (
              <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg px-3 py-2">
                Capacity: {selectedVehicle.maxCapacity.toLocaleString()} kg · Licensed for: {selectedDriver.licenseCategory.join(", ")}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Origin *</Label>
                <Input value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} placeholder="City Warehouse" className="bg-slate-800 border-slate-600 text-white h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Destination *</Label>
                <Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Distribution Hub" className="bg-slate-800 border-slate-600 text-white h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">
                  Cargo Weight (kg)
                  {selectedVehicle && form.cargoWeight > 0 && (
                    <span className={cn("ml-2", form.cargoWeight > selectedVehicle.maxCapacity ? "text-red-400" : "text-emerald-400")}>
                      {form.cargoWeight > selectedVehicle.maxCapacity ? `⚠ Exceeds ${selectedVehicle.maxCapacity}kg` : "✓ OK"}
                    </span>
                  )}
                </Label>
                <Input type="number" value={form.cargoWeight} onChange={e => setForm(f => ({ ...f, cargoWeight: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Revenue ($)</Label>
                <Input type="number" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Cargo Description</Label>
              <Input value={form.cargoDescription} onChange={e => setForm(f => ({ ...f, cargoDescription: e.target.value }))} placeholder="Electronics, machinery parts..." className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special instructions..." className="bg-slate-800 border-slate-600 text-white h-20 resize-none" />
            </div>
            {formError && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/40 border border-red-800/50 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setShowCreate(false); setFormError(""); }} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">Create Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Trip Dialog */}
      <Dialog open={!!completeTrip} onOpenChange={() => setCompleteTrip(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Complete Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-slate-400 text-sm">Enter the final odometer reading to complete this trip.</p>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Final Odometer (km)</Label>
              <Input
                type="number"
                value={finalOdometer}
                onChange={e => setFinalOdometer(Number(e.target.value))}
                className="bg-slate-800 border-slate-600 text-white h-9"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCompleteTrip(null)} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700 text-white">Mark Completed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
