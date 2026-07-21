"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings as SettingsIcon, Trash2, LogOut } from "lucide-react";

export function SettingsView() {
  const setView = useAppStore((s) => s.setView);
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Mock preferences — persisted in localStorage so playwright can assert them.
  const [prefs, setPrefs] = useState({
    emailMarketing: true,
    emailProduct: false,
    emailSecurity: true,
    language: "en-US",
    timezone: "UTC",
  });

  useEffect(() => {
    if (!user) setView("login");
  }, [user, setView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("fwr_prefs");
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPrefs(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const updatePref = <K extends keyof typeof prefs>(
    key: K,
    value: (typeof prefs)[K]
  ) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("fwr_prefs", JSON.stringify(next));
    }
    toast({ title: "Preference saved" });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("fwr_user");
    }
    logout();
    toast({ title: "Signed out" });
    setView("home");
  };

  const handleDeleteAccount = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fwr_user");
      localStorage.removeItem("fwr_prefs");
      localStorage.removeItem("fwr_cart");
      localStorage.removeItem("fwr_app");
    }
    logout();
    toast({
      title: "Account deleted",
      description: "All local data cleared (mock).",
      variant: "destructive",
    });
    setView("home");
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="settings-view">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-7 w-7" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage notifications, appearance, and your account.
        </p>
      </div>

      {/* Notifications */}
      <Card data-testid="settings-notifications-card">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label
                htmlFor="pref-marketing"
                className="font-medium cursor-pointer"
              >
                Marketing emails
              </Label>
              <p className="text-xs text-muted-foreground">
                Monthly newsletter and flight deals.
              </p>
            </div>
            <Switch
              id="pref-marketing"
              checked={prefs.emailMarketing}
              onCheckedChange={(v) => updatePref("emailMarketing", v)}
              data-testid="pref-marketing"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label
                htmlFor="pref-product"
                className="font-medium cursor-pointer"
              >
                Product updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Flight schedule changes and gate updates.
              </p>
            </div>
            <Switch
              id="pref-product"
              checked={prefs.emailProduct}
              onCheckedChange={(v) => updatePref("emailProduct", v)}
              data-testid="pref-product"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label
                htmlFor="pref-security"
                className="font-medium cursor-pointer"
              >
                Security alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Suspicious logins and booking changes.
              </p>
            </div>
            <Switch
              id="pref-security"
              checked={prefs.emailSecurity}
              onCheckedChange={(v) => updatePref("emailSecurity", v)}
              data-testid="pref-security"
            />
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card data-testid="settings-localization-card">
        <CardHeader>
          <CardTitle>Localization</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="pref-language">Language</Label>
            <Select
              value={prefs.language}
              onValueChange={(v) => updatePref("language", v)}
            >
              <SelectTrigger id="pref-language" data-testid="pref-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
                <SelectItem value="fr-FR">Français</SelectItem>
                <SelectItem value="de-DE">Deutsch</SelectItem>
                <SelectItem value="ja-JP">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="pref-timezone">Timezone</Label>
            <Select
              value={prefs.timezone}
              onValueChange={(v) => updatePref("timezone", v)}
            >
              <SelectTrigger id="pref-timezone" data-testid="pref-timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">
                  America / New York
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  America / Los Angeles
                </SelectItem>
                <SelectItem value="Europe/London">Europe / London</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia / Tokyo</SelectItem>
                <SelectItem value="Asia/Kolkata">Asia / Kolkata</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card data-testid="settings-appearance-card">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Dark mode</Label>
              <p className="text-xs text-muted-foreground">
                Toggle the site theme.
              </p>
            </div>
            <Switch
              checked={mounted ? theme === "dark" : false}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              data-testid="settings-dark-mode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card
        data-testid="settings-danger-card"
        className="border-destructive/40"
      >
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Sign out</Label>
              <p className="text-xs text-muted-foreground">
                End your session on this device.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              data-testid="settings-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Delete account</Label>
              <p className="text-xs text-muted-foreground">
                Permanently remove all local data (mock).
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  data-testid="settings-delete-trigger"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all your local data (bookings, preferences,
                    session). This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="settings-delete-cancel">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    data-testid="settings-delete-confirm"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
