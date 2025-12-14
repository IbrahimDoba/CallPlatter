"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Phone, Save, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface TransferSettingsProps {
  businessId: string | null;
}

export function TransferSettings({ businessId }: TransferSettingsProps) {
  const [transferEnabled, setTransferEnabled] = useState(false);
  const [transferPhoneNumber, setTransferPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!businessId || hasLoaded) return;

      setIsLoading(true);
      try {
        const response = await apiRequest('/agent/config', {
          method: 'GET',
        });

        if (response.data && response.data.config) {
          const { transferEnabled: enabled, transferPhoneNumber: phone } = response.data.config;
          setTransferEnabled(enabled || false);
          setTransferPhoneNumber(phone || "");
        }
      } catch (error) {
        console.error("Error loading transfer settings:", error);
        toast.error("Failed to load transfer settings");
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    };

    loadSettings();
  }, [businessId, hasLoaded]);

  const handleSave = async () => {
    if (!businessId) {
      toast.error("Business ID not found");
      return;
    }

    if (transferEnabled && !transferPhoneNumber.trim()) {
      toast.error("Please enter a transfer phone number");
      return;
    }

    // Validate phone number format (basic E.164 check)
    if (transferEnabled && !transferPhoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      toast.error("Please use E.164 format (e.g., +1234567890)");
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiRequest('/elevenlabs-management/update', {
        method: 'PUT',
        body: JSON.stringify({
          transferEnabled,
          transferPhoneNumber: transferEnabled ? transferPhoneNumber : null,
        }),
      });

      if (response.success) {
        toast.success("Transfer settings updated successfully");
      } else {
        toast.error(response.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving transfer settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save transfer settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          <CardTitle>Transfer to Human</CardTitle>
        </div>
        <CardDescription>
          Configure call transfer settings for your AI receptionist
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="transferEnabled" className="text-sm font-medium">
                Enable Transfer
              </Label>
              <p className="text-sm text-gray-500">
                Allow AI to transfer calls to a human agent when requested
              </p>
            </div>
            <Switch
              id="transferEnabled"
              checked={transferEnabled}
              onCheckedChange={setTransferEnabled}
            />
          </div>

          {transferEnabled && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="transferPhoneNumber" className="text-sm font-medium">
                Transfer Phone Number *
              </Label>
              <Input
                id="transferPhoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={transferPhoneNumber}
                onChange={(e) => setTransferPhoneNumber(e.target.value)}
                className="max-w-md"
              />
              <p className="text-xs text-gray-500">
                Use E.164 format with country code (e.g., +1234567890 for US, +2348123456789 for Nigeria)
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving || (transferEnabled && !transferPhoneNumber.trim())}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            How it works
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Callers can ask to speak to a human</li>
            <li>• AI will say "Transferring you to a human agent now"</li>
            <li>• Call will be transferred to the number above</li>
            <li>• Works 24/7 when enabled</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
