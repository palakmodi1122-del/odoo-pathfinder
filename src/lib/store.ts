"use client";

// ─── Types ─────────────────────────────────────────────────────────────────

export type VehicleType = "Truck" | "Van" | "Bike";
export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  type: VehicleType;
  maxCapacity: number; // kg
  odometer: number; // km
  status: VehicleStatus;
  region: string;
  acquisitionCost: number;
  year: number;
}

export type DriverStatus = "On Duty" | "Off Duty" | "Suspended" | "On Trip";

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string; // ISO date
  licenseCategory: VehicleType[];
  status: DriverStatus;
  safetyScore: number; // 0-100
  totalTrips: number;
  completedTrips: number;
  hireDate: string;
}

export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  cargoWeight: number; // kg
  cargoDescription: string;
  status: TripStatus;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  finalOdometer?: number;
  distanceKm?: number;
  revenue: number;
  notes: string;
}

export type MaintenanceType = "Oil Change" | "Tire Replacement" | "Brake Service" | "Engine Repair" | "General Inspection" | "Other";

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  cost: number;
  date: string;
  mechanic: string;
  resolved: boolean;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId?: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  date: string;
  odometer: number;
  station: string;
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

const seedVehicles: Vehicle[] = [
  { id: "v1", name: "Truck-01", model: "Volvo FH", licensePlate: "TRK-001", type: "Truck", maxCapacity: 20000, odometer: 145200, status: "Available", region: "North", acquisitionCost: 120000, year: 2021 },
  { id: "v2", name: "Truck-02", model: "Mercedes Actros", licensePlate: "TRK-002", type: "Truck", maxCapacity: 18000, odometer: 98400, status: "On Trip", region: "South", acquisitionCost: 115000, year: 2022 },
  { id: "v3", name: "Van-01", model: "Ford Transit", licensePlate: "VAN-001", type: "Van", maxCapacity: 1500, odometer: 67300, status: "Available", region: "East", acquisitionCost: 45000, year: 2022 },
  { id: "v4", name: "Van-02", model: "Mercedes Sprinter", licensePlate: "VAN-002", type: "Van", maxCapacity: 1200, odometer: 34100, status: "In Shop", region: "West", acquisitionCost: 48000, year: 2023 },
  { id: "v5", name: "Van-03", model: "VW Crafter", licensePlate: "VAN-003", type: "Van", maxCapacity: 1400, odometer: 52700, status: "On Trip", region: "North", acquisitionCost: 46000, year: 2022 },
  { id: "v6", name: "Van-04", model: "Renault Master", licensePlate: "VAN-004", type: "Van", maxCapacity: 1100, odometer: 22800, status: "Available", region: "South", acquisitionCost: 42000, year: 2023 },
  { id: "v7", name: "Bike-01", model: "Honda CB500", licensePlate: "BIK-001", type: "Bike", maxCapacity: 30, odometer: 18900, status: "Available", region: "East", acquisitionCost: 8000, year: 2023 },
  { id: "v8", name: "Bike-02", model: "Yamaha MT-07", licensePlate: "BIK-002", type: "Bike", maxCapacity: 25, odometer: 9400, status: "Available", region: "West", acquisitionCost: 9500, year: 2024 },
  { id: "v9", name: "Truck-03", model: "Scania R450", licensePlate: "TRK-003", type: "Truck", maxCapacity: 22000, odometer: 210500, status: "Retired", region: "North", acquisitionCost: 130000, year: 2018 },
];

const seedDrivers: Driver[] = [
  { id: "d1", name: "Alex Johnson", email: "alex@fleet.io", phone: "+1-555-0101", licenseNumber: "DL-A001", licenseExpiry: "2027-06-15", licenseCategory: ["Truck", "Van"], status: "On Trip", safetyScore: 92, totalTrips: 148, completedTrips: 145, hireDate: "2020-03-01" },
  { id: "d2", name: "Maria Garcia", email: "maria@fleet.io", phone: "+1-555-0102", licenseNumber: "DL-A002", licenseExpiry: "2025-12-31", licenseCategory: ["Van", "Bike"], status: "Off Duty", safetyScore: 88, totalTrips: 203, completedTrips: 198, hireDate: "2019-07-15" },
  { id: "d3", name: "James Brown", email: "james@fleet.io", phone: "+1-555-0103", licenseNumber: "DL-A003", licenseExpiry: "2026-09-20", licenseCategory: ["Truck"], status: "On Trip", safetyScore: 76, totalTrips: 312, completedTrips: 298, hireDate: "2018-01-10" },
  { id: "d4", name: "Sarah Lee", email: "sarah@fleet.io", phone: "+1-555-0104", licenseNumber: "DL-A004", licenseExpiry: "2026-04-01", licenseCategory: ["Van", "Bike"], status: "Off Duty", safetyScore: 95, totalTrips: 87, completedTrips: 86, hireDate: "2022-05-20" },
  { id: "d5", name: "Carlos Ruiz", email: "carlos@fleet.io", phone: "+1-555-0105", licenseNumber: "DL-A005", licenseExpiry: "2024-11-30", licenseCategory: ["Bike"], status: "Suspended", safetyScore: 52, totalTrips: 64, completedTrips: 55, hireDate: "2021-08-14" },
  { id: "d6", name: "Emily Chen", email: "emily@fleet.io", phone: "+1-555-0106", licenseNumber: "DL-A006", licenseExpiry: "2028-02-28", licenseCategory: ["Truck", "Van", "Bike"], status: "Off Duty", safetyScore: 99, totalTrips: 421, completedTrips: 420, hireDate: "2017-11-03" },
];

const seedTrips: Trip[] = [
  { id: "t1", vehicleId: "v2", driverId: "d3", origin: "Chicago Warehouse", destination: "Detroit Hub", cargoWeight: 15000, cargoDescription: "Auto parts", status: "Dispatched", createdAt: "2026-02-20T08:00:00Z", dispatchedAt: "2026-02-20T09:00:00Z", revenue: 2400, notes: "" },
  { id: "t2", vehicleId: "v5", driverId: "d1", origin: "LA Port", destination: "Phoenix DC", cargoWeight: 1100, cargoDescription: "Electronics", status: "Dispatched", createdAt: "2026-02-20T10:00:00Z", dispatchedAt: "2026-02-20T11:00:00Z", revenue: 850, notes: "" },
  { id: "t3", vehicleId: "v1", driverId: "d6", origin: "NYC Distribution", destination: "Boston Depot", cargoWeight: 18000, cargoDescription: "Retail goods", status: "Completed", createdAt: "2026-02-18T06:00:00Z", dispatchedAt: "2026-02-18T07:00:00Z", completedAt: "2026-02-18T18:00:00Z", finalOdometer: 145580, distanceKm: 380, revenue: 3200, notes: "On time delivery" },
  { id: "t4", vehicleId: "v3", driverId: "d4", origin: "Miami Port", destination: "Orlando Center", cargoWeight: 900, cargoDescription: "Food products", status: "Completed", createdAt: "2026-02-17T07:00:00Z", dispatchedAt: "2026-02-17T08:00:00Z", completedAt: "2026-02-17T14:00:00Z", finalOdometer: 67545, distanceKm: 245, revenue: 680, notes: "" },
  { id: "t5", vehicleId: "v7", driverId: "d2", origin: "Downtown Store", destination: "Suburb Client", cargoWeight: 20, cargoDescription: "Documents", status: "Completed", createdAt: "2026-02-19T09:00:00Z", dispatchedAt: "2026-02-19T09:30:00Z", completedAt: "2026-02-19T11:00:00Z", finalOdometer: 18960, distanceKm: 60, revenue: 120, notes: "" },
  { id: "t6", vehicleId: "v4", driverId: "d5", origin: "Dallas Hub", destination: "Houston Depot", cargoWeight: 800, cargoDescription: "Machinery parts", status: "Cancelled", createdAt: "2026-02-16T10:00:00Z", revenue: 0, notes: "Driver suspended" },
];

const seedMaintenanceLogs: MaintenanceLog[] = [
  { id: "m1", vehicleId: "v4", type: "Engine Repair", description: "Engine overhaul after warning light", cost: 3200, date: "2026-02-19", mechanic: "Tony's Auto Shop", resolved: false },
  { id: "m2", vehicleId: "v9", type: "General Inspection", description: "Pre-retirement final inspection", cost: 450, date: "2026-01-15", mechanic: "Fleet Garage", resolved: true },
  { id: "m3", vehicleId: "v1", type: "Oil Change", description: "Routine 20k km oil change", cost: 180, date: "2026-02-10", mechanic: "Fleet Garage", resolved: true },
  { id: "m4", vehicleId: "v3", type: "Tire Replacement", description: "Replaced 2 front tires", cost: 620, date: "2026-02-05", mechanic: "Tire Pro", resolved: true },
  { id: "m5", vehicleId: "v2", type: "Brake Service", description: "Brake pad replacement", cost: 380, date: "2026-01-28", mechanic: "Fleet Garage", resolved: true },
];

const seedFuelLogs: FuelLog[] = [
  { id: "f1", vehicleId: "v1", tripId: "t3", liters: 120, costPerLiter: 1.45, totalCost: 174, date: "2026-02-18", odometer: 145300, station: "Shell Highway 9" },
  { id: "f2", vehicleId: "v2", liters: 200, costPerLiter: 1.42, totalCost: 284, date: "2026-02-20", odometer: 98200, station: "BP Station 4" },
  { id: "f3", vehicleId: "v3", tripId: "t4", liters: 45, costPerLiter: 1.50, totalCost: 67.5, date: "2026-02-17", odometer: 67400, station: "Exxon I-95" },
  { id: "f4", vehicleId: "v5", liters: 55, costPerLiter: 1.48, totalCost: 81.4, date: "2026-02-20", odometer: 52500, station: "Chevron 101" },
  { id: "f5", vehicleId: "v7", tripId: "t5", liters: 3, costPerLiter: 1.60, totalCost: 4.8, date: "2026-02-19", odometer: 18920, station: "Local Pump" },
  { id: "f6", vehicleId: "v1", liters: 130, costPerLiter: 1.44, totalCost: 187.2, date: "2026-01-30", odometer: 144900, station: "Shell Highway 9" },
  { id: "f7", vehicleId: "v6", liters: 40, costPerLiter: 1.50, totalCost: 60, date: "2026-02-15", odometer: 22600, station: "Total Station" },
];

// ─── Store ──────────────────────────────────────────────────────────────────

type Listener = () => void;

class FleetStore {
  vehicles: Vehicle[] = [...seedVehicles];
  drivers: Driver[] = [...seedDrivers];
  trips: Trip[] = [...seedTrips];
  maintenanceLogs: MaintenanceLog[] = [...seedMaintenanceLogs];
  fuelLogs: FuelLog[] = [...seedFuelLogs];

  private listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  // ── Vehicles ──────────────────────────────────────────────────────────────

  addVehicle(v: Omit<Vehicle, "id" | "status">) {
    const vehicle: Vehicle = { ...v, id: `v${Date.now()}`, status: "Available" };
    this.vehicles = [...this.vehicles, vehicle];
    this.notify();
    return vehicle;
  }

  updateVehicle(id: string, patch: Partial<Vehicle>) {
    this.vehicles = this.vehicles.map(v => v.id === id ? { ...v, ...patch } : v);
    this.notify();
  }

  retireVehicle(id: string) {
    this.vehicles = this.vehicles.map(v => v.id === id ? { ...v, status: "Retired" } : v);
    this.notify();
  }

  // ── Drivers ───────────────────────────────────────────────────────────────

  addDriver(d: Omit<Driver, "id" | "status" | "safetyScore" | "totalTrips" | "completedTrips">) {
    const driver: Driver = { ...d, id: `d${Date.now()}`, status: "Off Duty", safetyScore: 100, totalTrips: 0, completedTrips: 0 };
    this.drivers = [...this.drivers, driver];
    this.notify();
    return driver;
  }

  updateDriver(id: string, patch: Partial<Driver>) {
    this.drivers = this.drivers.map(d => d.id === id ? { ...d, ...patch } : d);
    this.notify();
  }

  isDriverLicenseValid(driverId: string): boolean {
    const driver = this.drivers.find(d => d.id === driverId);
    if (!driver) return false;
    return new Date(driver.licenseExpiry) > new Date();
  }

  // ── Trips ─────────────────────────────────────────────────────────────────

  createTrip(t: Omit<Trip, "id" | "status" | "createdAt">): { success: boolean; error?: string; trip?: Trip } {
    const vehicle = this.vehicles.find(v => v.id === t.vehicleId);
    const driver = this.drivers.find(d => d.id === t.driverId);

    if (!vehicle) return { success: false, error: "Vehicle not found" };
    if (!driver) return { success: false, error: "Driver not found" };
    if (vehicle.status !== "Available") return { success: false, error: "Vehicle is not available" };
    if (driver.status !== "Off Duty") return { success: false, error: "Driver is not available" };
    if (t.cargoWeight > vehicle.maxCapacity) return { success: false, error: `Cargo weight (${t.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)` };
    if (!this.isDriverLicenseValid(t.driverId)) return { success: false, error: "Driver license is expired" };
    if (!driver.licenseCategory.includes(vehicle.type)) return { success: false, error: `Driver is not licensed for ${vehicle.type}` };

    const trip: Trip = { ...t, id: `t${Date.now()}`, status: "Draft", createdAt: new Date().toISOString() };
    this.trips = [...this.trips, trip];
    this.notify();
    return { success: true, trip };
  }

  dispatchTrip(tripId: string) {
    const trip = this.trips.find(t => t.id === tripId);
    if (!trip || trip.status !== "Draft") return;
    this.trips = this.trips.map(t => t.id === tripId ? { ...t, status: "Dispatched", dispatchedAt: new Date().toISOString() } : t);
    this.vehicles = this.vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: "On Trip" } : v);
    this.drivers = this.drivers.map(d => d.id === trip.driverId ? { ...d, status: "On Trip", totalTrips: d.totalTrips + 1 } : d);
    this.notify();
  }

  completeTrip(tripId: string, finalOdometer: number) {
    const trip = this.trips.find(t => t.id === tripId);
    if (!trip || trip.status !== "Dispatched") return;
    const vehicle = this.vehicles.find(v => v.id === trip.vehicleId);
    const distanceKm = vehicle ? finalOdometer - vehicle.odometer : undefined;
    this.trips = this.trips.map(t => t.id === tripId ? { ...t, status: "Completed", completedAt: new Date().toISOString(), finalOdometer, distanceKm } : t);
    this.vehicles = this.vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: "Available", odometer: finalOdometer } : v);
    this.drivers = this.drivers.map(d => d.id === trip.driverId ? { ...d, status: "Off Duty", completedTrips: d.completedTrips + 1 } : d);
    this.notify();
  }

  cancelTrip(tripId: string) {
    const trip = this.trips.find(t => t.id === tripId);
    if (!trip || (trip.status !== "Draft" && trip.status !== "Dispatched")) return;
    this.trips = this.trips.map(t => t.id === tripId ? { ...t, status: "Cancelled" } : t);
    if (trip.status === "Dispatched") {
      this.vehicles = this.vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: "Available" } : v);
      this.drivers = this.drivers.map(d => d.id === trip.driverId ? { ...d, status: "Off Duty" } : d);
    }
    this.notify();
  }

  // ── Maintenance ───────────────────────────────────────────────────────────

  addMaintenanceLog(m: Omit<MaintenanceLog, "id" | "resolved">) {
    const log: MaintenanceLog = { ...m, id: `m${Date.now()}`, resolved: false };
    this.maintenanceLogs = [...this.maintenanceLogs, log];
    // Auto-set vehicle to In Shop
    this.vehicles = this.vehicles.map(v => v.id === m.vehicleId ? { ...v, status: "In Shop" } : v);
    this.notify();
    return log;
  }

  resolveMaintenanceLog(id: string) {
    const log = this.maintenanceLogs.find(m => m.id === id);
    if (!log) return;
    this.maintenanceLogs = this.maintenanceLogs.map(m => m.id === id ? { ...m, resolved: true } : m);
    // Check if vehicle has any unresolved logs; if none, set back to Available
    const unresolvedForVehicle = this.maintenanceLogs.filter(m => m.vehicleId === log.vehicleId && !m.resolved && m.id !== id);
    if (unresolvedForVehicle.length === 0) {
      this.vehicles = this.vehicles.map(v => v.id === log.vehicleId ? { ...v, status: "Available" } : v);
    }
    this.notify();
  }

  // ── Fuel ──────────────────────────────────────────────────────────────────

  addFuelLog(f: Omit<FuelLog, "id">) {
    const log: FuelLog = { ...f, id: `f${Date.now()}` };
    this.fuelLogs = [...this.fuelLogs, log];
    this.notify();
    return log;
  }

  // ── Analytics Helpers ─────────────────────────────────────────────────────

  getTotalFuelCostForVehicle(vehicleId: string) {
    return this.fuelLogs.filter(f => f.vehicleId === vehicleId).reduce((sum, f) => sum + f.totalCost, 0);
  }

  getTotalMaintenanceCostForVehicle(vehicleId: string) {
    return this.maintenanceLogs.filter(m => m.vehicleId === vehicleId).reduce((sum, m) => sum + m.cost, 0);
  }

  getTotalRevenueForVehicle(vehicleId: string) {
    return this.trips.filter(t => t.vehicleId === vehicleId && t.status === "Completed").reduce((sum, t) => sum + t.revenue, 0);
  }

  getVehicleROI(vehicleId: string) {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || vehicle.acquisitionCost === 0) return 0;
    const revenue = this.getTotalRevenueForVehicle(vehicleId);
    const costs = this.getTotalFuelCostForVehicle(vehicleId) + this.getTotalMaintenanceCostForVehicle(vehicleId);
    return ((revenue - costs) / vehicle.acquisitionCost) * 100;
  }

  getFuelEfficiency(vehicleId: string) {
    const completedTrips = this.trips.filter(t => t.vehicleId === vehicleId && t.status === "Completed" && t.distanceKm);
    const totalKm = completedTrips.reduce((sum, t) => sum + (t.distanceKm || 0), 0);
    const totalLiters = this.fuelLogs.filter(f => f.vehicleId === vehicleId).reduce((sum, f) => sum + f.liters, 0);
    if (totalLiters === 0) return 0;
    return totalKm / totalLiters;
  }

  getCostPerKm(vehicleId: string) {
    const completedTrips = this.trips.filter(t => t.vehicleId === vehicleId && t.status === "Completed" && t.distanceKm);
    const totalKm = completedTrips.reduce((sum, t) => sum + (t.distanceKm || 0), 0);
    if (totalKm === 0) return 0;
    const totalCosts = this.getTotalFuelCostForVehicle(vehicleId) + this.getTotalMaintenanceCostForVehicle(vehicleId);
    return totalCosts / totalKm;
  }
}

// Singleton
let storeInstance: FleetStore | null = null;

export function getStore(): FleetStore {
  if (typeof window === "undefined") {
    return new FleetStore();
  }
  if (!storeInstance) {
    storeInstance = new FleetStore();
  }
  return storeInstance;
}
