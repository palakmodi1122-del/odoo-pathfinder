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
import { Plus, Search, Truck, Edit2, PowerOff, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Vehicle, VehicleType } from "@/lib/store";

const STATUS_COLORS: Record<string, string> = {
  Available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "On Trip": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "In Shop": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Retired: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const defaultForm = {
  name: "", model: "", licensePlate: "", type: "Van" as VehicleType,
  maxCapacity: 1000, odometer: 0, region: "", acquisitionCost: 0, year: new Date().getFullYear(),
};

export default function VehiclesPage() {
  const store = useStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filtered = store.vehicles.filter(v => {
    const q = search.toLowerCase();
    if (q && !v.name.toLowerCase().includes(q) && !v.licensePlate.toLowerCase().includes(q) && !v.model.toLowerCase().includes(q)) return false;
    if (typeFilter !== "All" && v.type !== typeFilter) return false;
    if (statusFilter !== "All" && v.status !== statusFilter) return false;
    return true;
  });

  function openAdd() {
    setForm(defaultForm);
    setEditVehicle(null);
    setShowAdd(true);
  }

  function openEdit(v: Vehicle) {
    setForm({ name: v.name, model: v.model, licensePlate: v.licensePlate, type: v.type, maxCapacity: v.maxCapacity, odometer: v.odometer, region: v.region, acquisitionCost: v.acquisitionCost, year: v.year });
    setEditVehicle(v);
    setShowAdd(true);
  }

  function handleSave() {
    if (!form.name || !form.licensePlate || !form.model || !form.region) return;
    if (editVehicle) {
      store.updateVehicle(editVehicle.id, form);
    } else {
      store.addVehicle(form);
    }
    setShowAdd(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vehicle Registry</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your fleet assets</p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Fleet", count: store.vehicles.length, color: "text-white" },
          { label: "Available", count: store.vehicles.filter(v => v.status === "Available").length, color: "text-emerald-400" },
          { label: "On Trip", count: store.vehicles.filter(v => v.status === "On Trip").length, color: "text-blue-400" },
          { label: "In Shop", count: store.vehicles.filter(v => v.status === "In Shop").length, color: "text-amber-400" },
        ].map(s => (
          <Card key={s.label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className={cn("text-2xl font-bold", s.color)}>{s.count}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search vehicles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32 h-9 bg-slate-900 border-slate-700 text-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {["All", "Truck", "Van", "Bike"].map(t => (
              <SelectItem key={t} value={t} className="text-slate-300">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9 bg-slate-900 border-slate-700 text-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {["All", "Available", "On Trip", "In Shop", "Retired"].map(s => (
              <SelectItem key={s} value={s} className="text-slate-300">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Vehicle", "License Plate", "Type", "Capacity", "Odometer", "Region", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{v.name}</div>
                          <div className="text-xs text-slate-500">{v.model} · {v.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <code className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">{v.licensePlate}</code>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{v.type}</td>
                    <td className="px-5 py-3 text-slate-300 text-xs">{v.maxCapacity.toLocaleString()} kg</td>
                    <td className="px-5 py-3 text-slate-300 text-xs">{v.odometer.toLocaleString()} km</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{v.region}</td>
                    <td className="px-5 py-3">
                      <Badge className={cn("text-xs border", STATUS_COLORS[v.status])}>{v.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem
                            onClick={() => openEdit(v)}
                            className="text-slate-300 hover:text-white cursor-pointer gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          {v.status !== "Retired" && (
                            <DropdownMenuItem
                              onClick={() => store.retireVehicle(v.id)}
                              className="text-red-400 hover:text-red-300 cursor-pointer gap-2"
                            >
                              <PowerOff className="w-3.5 h-3.5" /> Retire
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                      No vehicles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Van-05" className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Model *</Label>
              <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Ford Transit" className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">License Plate *</Label>
              <Input value={form.licensePlate} onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value }))} placeholder="VAN-005" className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as VehicleType }))}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {["Truck", "Van", "Bike"].map(t => <SelectItem key={t} value={t} className="text-slate-300">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Max Capacity (kg)</Label>
              <Input type="number" value={form.maxCapacity} onChange={e => setForm(f => ({ ...f, maxCapacity: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Odometer (km)</Label>
              <Input type="number" value={form.odometer} onChange={e => setForm(f => ({ ...f, odometer: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Region *</Label>
              <Input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} placeholder="North" className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Year</Label>
              <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-slate-300 text-xs">Acquisition Cost ($)</Label>
              <Input type="number" value={form.acquisitionCost} onChange={e => setForm(f => ({ ...f, acquisitionCost: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              {editVehicle ? "Save Changes" : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
