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
import { Plus, Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaintenanceType } from "@/lib/store";

const MAINTENANCE_TYPES: MaintenanceType[] = [
  "Oil Change", "Tire Replacement", "Brake Service", "Engine Repair", "General Inspection", "Other"
];

const defaultForm = {
  vehicleId: "", type: "Oil Change" as MaintenanceType,
  description: "", cost: 0, date: new Date().toISOString().slice(0, 10), mechanic: "",
};

export default function MaintenancePage() {
  const store = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [filter, setFilter] = useState("All");

  const logs = [...store.maintenanceLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered = logs.filter(l => {
    if (filter === "Active") return !l.resolved;
    if (filter === "Resolved") return l.resolved;
    return true;
  });

  function handleAdd() {
    if (!form.vehicleId || !form.description || !form.mechanic) return;
    store.addMaintenanceLog(form);
    setShowAdd(false);
    setForm(defaultForm);
  }

  const inShopVehicles = store.vehicles.filter(v => v.status === "In Shop");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance & Service</h1>
          <p className="text-slate-400 text-sm mt-1">Track preventative and reactive vehicle maintenance</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Log Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Logs", count: store.maintenanceLogs.length, color: "text-white" },
          { label: "Active / In Shop", count: store.maintenanceLogs.filter(m => !m.resolved).length, color: "text-amber-400" },
          { label: "Resolved", count: store.maintenanceLogs.filter(m => m.resolved).length, color: "text-emerald-400" },
          { label: "Total Cost", count: `$${store.maintenanceLogs.reduce((s, m) => s + m.cost, 0).toLocaleString()}`, color: "text-blue-400" },
        ].map(s => (
          <Card key={s.label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className={cn("text-2xl font-bold", s.color)}>{s.count}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* In Shop Alert */}
      {inShopVehicles.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-amber-300 text-sm font-medium">Vehicles Currently In Shop</div>
            <div className="text-amber-500 text-xs mt-1 flex flex-wrap gap-2 mt-1">
              {inShopVehicles.map(v => (
                <span key={v.id} className="bg-amber-900/30 px-2 py-0.5 rounded">{v.name} ({v.licensePlate})</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {["All", "Active", "Resolved"].map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(f)}
            className={cn(
              "h-8 px-4 text-xs",
              filter === f ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Logs Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Vehicle", "Type", "Description", "Cost", "Date", "Mechanic", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(log => {
                  const vehicle = store.vehicles.find(v => v.id === log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-200 text-xs">{vehicle?.name ?? "—"}</div>
                        <div className="text-xs text-slate-500">{vehicle?.licensePlate}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Wrench className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-300 text-xs">{log.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs max-w-[200px] truncate">{log.description}</td>
                      <td className="px-5 py-3 text-slate-300 text-xs font-medium">${log.cost.toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{log.date}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{log.mechanic}</td>
                      <td className="px-5 py-3">
                        {log.resolved ? (
                          <Badge className="text-xs border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" /> Resolved
                          </Badge>
                        ) : (
                          <Badge className="text-xs border bg-amber-500/15 text-amber-400 border-amber-500/30">
                            <Clock className="w-3 h-3 mr-1" /> Active
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {!log.resolved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => store.resolveMaintenanceLog(log.id)}
                            className="h-7 px-3 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                          >
                            Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-500">No maintenance logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Log Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Maintenance Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3 text-xs text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Adding a vehicle to maintenance will automatically set it to &quot;In Shop&quot; status.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Vehicle *</Label>
                <Select value={form.vehicleId} onValueChange={v => setForm(f => ({ ...f, vehicleId: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 h-9">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {store.vehicles.filter(v => v.status !== "Retired").map(v => (
                      <SelectItem key={v.id} value={v.id} className="text-slate-300">{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Service Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as MaintenanceType }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {MAINTENANCE_TYPES.map(t => <SelectItem key={t} value={t} className="text-slate-300">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Description *</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the service work..."
                className="bg-slate-800 border-slate-600 text-white h-20 resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Cost ($)</Label>
                <Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))} className="bg-slate-800 border-slate-600 text-white h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-slate-800 border-slate-600 text-white h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Mechanic *</Label>
                <Input value={form.mechanic} onChange={e => setForm(f => ({ ...f, mechanic: e.target.value }))} placeholder="Shop name" className="bg-slate-800 border-slate-600 text-white h-9" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">Log Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
