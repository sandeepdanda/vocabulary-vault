"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    setMounted(true);
    // Read username from cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split("=");
      if (key === "username") {
        setUsername(decodeURIComponent(value));
        break;
      }
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Clear cookies client-side even if API fails
    }
    router.push("/login");
  }, [router]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportError("");
    try {
      const data = await api.exportVault();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vault_export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Failed to export vault. Please try again.");
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Username</p>
              <p className="text-sm text-muted-foreground">
                {username || "Unknown"}
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </Button>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose your preferred appearance
              </p>
            </div>
            {mounted && (
              <div className="flex rounded-lg p-1 gap-1">
                {([
                  { value: "light", label: "☀️ Light" },
                  { value: "dark", label: "🌙 Dark" },
                  { value: "system", label: "🖥️ System" },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      theme === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export Vault</p>
              <p className="text-sm text-muted-foreground">
                Download all your words as JSON
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>
          {exportError && (
            <p className="text-sm text-destructive mt-2">{exportError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
