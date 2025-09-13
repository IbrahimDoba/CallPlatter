"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Settings, Phone, Clock, MessageSquare, Bell } from "lucide-react";
import { api } from "@/lib/api";

interface BusinessSettings {
  name: string;
  email: string;
  phoneNumber: string;
  workingHours: {
    start: string;
    end: string;
  };
  aiGreeting: string;
  autoReply: boolean;
  notifications: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<BusinessSettings>({
    name: "",
    email: "",
    phoneNumber: "",
    workingHours: {
      start: "09:00",
      end: "17:00",
    },
    aiGreeting: "",
    autoReply: true,
    notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.settings.get();
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        // Settings endpoint is not implemented yet, so we'll handle gracefully
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchSettings();
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.settings.update(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your AI receptionist settings
          </p>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your AI receptionist settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Update your business details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Enter your business name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={settings.phoneNumber}
              onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
              placeholder="+234 123 456 7890"
            />
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours
          </CardTitle>
          <CardDescription>
            Set when your AI receptionist should handle calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, start: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, end: e.target.value }
                })}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Calls outside these hours will be handled by the AI receptionist
          </p>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Receptionist Settings
          </CardTitle>
          <CardDescription>
            Customize how your AI receptionist interacts with callers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aiGreeting">AI Greeting Message</Label>
            <Textarea
              id="aiGreeting"
              value={settings.aiGreeting}
              onChange={(e) => setSettings({ ...settings, aiGreeting: e.target.value })}
              placeholder="Hello, thank you for calling [Business Name]. How can I assist you today?"
              rows={3}
            />
            <p className="text-sm text-gray-600">
              This is the message your AI will use to greet callers
            </p>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Reply to Missed Calls</Label>
              <p className="text-sm text-gray-600">
                Automatically respond to missed calls with AI
              </p>
            </div>
            <Switch
              checked={settings.autoReply}
              onCheckedChange={(checked) => setSettings({ ...settings, autoReply: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications about calls and appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">
                Receive email notifications for new calls and appointments
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect with external tools and services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              value={`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/appointments`}
              readOnly
            />
            <p className="text-sm text-gray-600">
              Use this webhook URL to integrate with Zapier, Make.com, or n8n
            </p>
          </div>
          <Button variant="outline">
            View Integration Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
