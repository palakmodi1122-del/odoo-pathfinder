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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Users, AlertTriangle, Shield, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Driver, DriverStatus, VehicleType } from "@/lib/store";

const STATUS_COLORS: Record<string, string> = {
  "On Trip": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "On Duty": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Off Duty": "bg-slate-500/15 text-slate-400 border-slate-500/30",
  Suspended: "bg-red-500/15 text-red-400 border-red-500/30",
};

const defaultForm = {
  name: "", email: "", phone: "", licenseNumber: "",
  licenseExpiry: "", licenseCategory: [] as VehicleType[], hireDate: new Date().toISOString().slice(0, 10),
};

function SafetyBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[80px]">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn("text-xs font-medium", score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400")}>
        {score}
      </span>
    </div>
  );
}

export default function DriversPage() {
  const store = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [statusFilter, setStatusFilter] = useState("All");

  const now = new Date();

  const filtered = store.drivers.filter(d => statusFilter === "All" || d.status === statusFilter);

  function openAdd() {
    setForm(defaultForm);
    setEditDriver(null);
    setShowAdd(true);
  }

  function openEdit(d: Driver) {
    setForm({
      name: d.name, email: d.email, phone: d.phone,
      licenseNumber: d.licenseNumber, licenseExpiry: d.licenseExpiry,
      licenseCategory: d.licenseCategory, hireDate: d.hireDate,
    });
    setEditDriver(d);
    setShowAdd(true);
  }

  function handleSave() {
    if (!form.name || !form.email || !form.licenseNumber || !form.licenseExpiry || form.licenseCategory.length === 0) return;
    if (editDriver) {
      store.updateDriver(editDriver.id, form);
    } else {
      store.addDriver(form);
    }
    setShowAdd(false);
  }

  function toggleStatus(d: Driver) {
    const next: DriverStatus = d.status === "Off Duty" ? "On Duty" : d.status === "On Duty" ? "Off Duty" : d.status === "Suspended" ? "Off Duty" : "Suspended";
    store.updateDriver(d.id, { status: next });
  }

  function toggleCategory(cat: VehicleType) {
    setForm(f => ({
      ...f,
      licenseCategory: f.licenseCategory.includes(cat)
        ? f.licenseCategory.filter(c => c !== cat)
        : [...f.licenseCategory, cat],
    }));
  }

  const expiredCount = store.drivers.filter(d => new Date(d.licenseExpiry) < now).length;
  const completionRate = (d: Driver) => d.totalTrips > 0 ? Math.round((d.completedTrips / d.totalTrips) * 100) : 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Driver Profiles</h1>
          <p className="text-slate-400 text-sm mt-1">Performance, compliance and safety management</p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Driver
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Drivers", count: store.drivers.length, color: "text-white" },
          { label: "Active / On Trip", count: store.drivers.filter(d => d.status === "On Duty" || d.status === "On Trip").length, color: "text-emerald-400" },
          { label: "Suspended", count: store.drivers.filter(d => d.status === "Suspended").length, color: "text-red-400" },
          { label: "Expired License", count: expiredCount, color: "text-orange-400" },
        ].map(s => (
          <Card key={s.label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className={cn("text-2xl font-bold", s.color)}>{s.count}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expired License Alert */}
      {expiredCount > 0 && (
        <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="text-red-300 text-sm">
            <span className="font-medium">{expiredCount} driver{expiredCount > 1 ? "s" : ""}</span> have expired licenses and are blocked from new assignments.
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["All", "On Trip", "On Duty", "Off Duty", "Suspended"].map(s => (
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

      {/* Drivers Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Driver", "License", "Categories", "Expiry", "Safety Score", "Trips", "Completion", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(d => {
                  const expired = new Date(d.licenseExpiry) < now;
                  const expiringSoon = !expired && new Date(d.licenseExpiry) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {d.name[0]}
                          </div>
                          <div>
                            <div className="font-medium text-slate-200 text-xs">{d.name}</div>
                            <div className="text-xs text-slate-500">{d.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <code className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">{d.licenseNumber}</code>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {d.licenseCategory.map(c => (
                            <Badge key={c} className="text-xs border border-slate-700 bg-slate-800 text-slate-300 px-1.5">{c}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn("text-xs", expired ? "text-red-400 font-medium" : expiringSoon ? "text-amber-400" : "text-slate-400")}>
                          {expired ? "⚠ EXPIRED" : expiringSoon ? "⚡ " : ""}{d.licenseExpiry}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <SafetyBar score={d.safetyScore} />
                      </td>
                      <td className="px-5 py-3 text-slate-300 text-xs">{d.totalTrips}</td>
                      <td className="px-5 py-3 text-slate-300 text-xs">{completionRate(d)}%</td>
                      <td className="px-5 py-3">
                        <Badge className={cn("text-xs border", STATUS_COLORS[d.status])}>{d.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(d)} className="h-7 w-7 p-0 text-slate-500 hover:text-white">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          {d.status !== "On Trip" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStatus(d)}
                              className={cn(
                                "h-7 px-2 text-xs",
                                d.status === "Suspended" ? "text-emerald-400 hover:bg-emerald-950/30" : "text-red-400 hover:bg-red-950/30"
                              )}
                            >
                              {d.status === "Suspended" ? "Reinstate" : "Suspend"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-500">No drivers found</td></tr>
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
            <DialogTitle>{editDriver ? "Edit Driver" : "Add Driver"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Full Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alex Johnson" className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Email *</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="alex@fleet.io" className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1-555-0100" className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">License Number *</Label>
              <Input value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} placeholder="DL-A007" className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">License Expiry *</Label>
              <Input type="date" value={form.licenseExpiry} onChange={e => setForm(f => ({ ...f, licenseExpiry: e.target.value }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Hire Date</Label>
              <Input type="date" value={form.hireDate} onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))} className="bg-slate-800 border-slate-600 text-white h-9" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-slate-300 text-xs">License Categories * (select all that apply)</Label>
              <div className="flex gap-4">
                {(["Truck", "Van", "Bike"] as VehicleType[]).map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.licenseCategory.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                      className="border-slate-600"
                    />
                    <span className="text-slate-300 text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              {editDriver ? "Save Changes" : "Add Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
