"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Eye, EyeOff, AlertCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "manager@fleet.io", password: "fleet123", role: "Fleet Manager" },
  { email: "dispatcher@fleet.io", password: "fleet123", role: "Dispatcher" },
  { email: "safety@fleet.io", password: "fleet123", role: "Safety Officer" },
  { email: "finance@fleet.io", password: "fleet123", role: "Financial Analyst" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
      if (account) {
        if (typeof window !== "undefined") {
          localStorage.setItem("fleetflow_user", JSON.stringify({ email: account.email, role: account.role }));
        }
        router.push("/dashboard");
      } else {
        setError("Invalid email or password. Try a demo account below.");
        setLoading(false);
      }
    }, 600);
  }

  function quickLogin(account: typeof DEMO_ACCOUNTS[0]) {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg mb-2">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FleetFlow</h1>
          <p className="text-slate-400 text-sm">Fleet & Logistics Management System</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Sign in</CardTitle>
            <CardDescription className="text-slate-400">Access your fleet management dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@fleet.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <button type="button" className="w-full text-center text-sm text-slate-400 hover:text-blue-400 transition-colors">
                Forgot password?
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-slate-300 text-sm font-medium">Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(account => (
                <button
                  key={account.email}
                  onClick={() => quickLogin(account)}
                  className="text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 transition-all group"
                >
                  <div className="text-xs text-slate-400 group-hover:text-slate-300 truncate">{account.email}</div>
                  <Badge variant="outline" className="mt-1 text-xs border-blue-600/50 text-blue-400 px-1.5 py-0">
                    {account.role}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
