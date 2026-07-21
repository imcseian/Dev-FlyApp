"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-app-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, User as UserIcon } from "lucide-react";

export function ProfileView() {
  const setView = useAppStore((s) => s.setView);
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) setView("login");
  }, [user, setView]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar);
    }
  }, [user]);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Upload failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      setAvatar(data.url);
      toast({
        title: "Avatar uploaded",
        description: `${data.file.name} (${(data.file.size / 1024).toFixed(1)} KB)`,
      });
    } finally {
      setUploading(false);
      // Reset file input so re-uploading the same file fires onChange again.
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Mock save — just update local state + localStorage. No backend endpoint.
    const updated = { ...user, name, avatar };
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("fwr_user", JSON.stringify(updated));
    }
    await new Promise((r) => setTimeout(r, 400));
    toast({ title: "Profile saved" });
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="profile-view">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your details and avatar.
        </p>
      </div>

      <Card data-testid="profile-avatar-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Avatar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-20 w-20" data-testid="profile-avatar">
            <AvatarImage src={avatar} alt={user.name} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-2 flex-1">
            <Label
              htmlFor="avatar-upload"
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                asChild
              >
                <span>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload new avatar
                    </>
                  )}
                </span>
              </Button>
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="sr-only"
              data-testid="profile-avatar-input"
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              PNG or JPG, max 5MB.
            </p>
            {avatar && (
              <div
                className="text-xs text-muted-foreground font-mono break-all"
                data-testid="profile-avatar-url"
              >
                <span className="opacity-60">URL: </span>
                {avatar}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="profile-form-card">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="profile-name">Display name</Label>
              <Input
                id="profile-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="profile-name-input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                data-testid="profile-email-input"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed in the playground.
              </p>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={saving || name === user.name}
                data-testid="profile-save"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setView("dashboard")}
                data-testid="profile-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
