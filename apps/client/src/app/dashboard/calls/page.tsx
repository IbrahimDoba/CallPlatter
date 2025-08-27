"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  Calendar,
  User,
  Clock,
  Wifi,
  WifiOff,
  PhoneCall,
} from "lucide-react";
import { useSocketContext } from "@/components/providers/socket-provider";
import CallTestingModal from "@/components/CallTestingModal";

interface Call {
  id: string;
  customerName: string | null;
  customerPhone: string;
  transcript: string | null;
  intent: string | null;
  createdAt: string;
}

export default function CallsPage() {
  const { data: session } = useSession();
  const { isConnected, joinBusiness } = useSocketContext();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const response = await fetch("/api/calls");
        if (response.ok) {
          const data = await response.json();
          setCalls(data.calls);

          // If we have calls, extract business ID from the first call or use a default
          if (data.calls.length > 0 && data.calls[0].businessId) {
            setBusinessId(data.calls[0].businessId);
          } else if (session?.user?.id) {
            // Use user ID as business ID if no business ID in calls
            setBusinessId(session.user.id);
          }
        }
      } catch (error) {
        console.error("Error fetching calls:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCalls();
    }
  }, [session]);

  // Join business room when businessId is available and connected
  useEffect(() => {
    if (businessId && isConnected) {
      joinBusiness(businessId);
    }
  }, [businessId, isConnected, joinBusiness]);

  // Set up real-time call updates
  useEffect(() => {
    const handleCallUpdated = (event: CustomEvent) => {
      const updatedCall = event.detail;
      setCalls((prevCalls) => {
        const existingCallIndex = prevCalls.findIndex(
          (call) => call.id === updatedCall.id
        );
        if (existingCallIndex >= 0) {
          // Update existing call
          const newCalls = [...prevCalls];
          newCalls[existingCallIndex] = {
            ...newCalls[existingCallIndex],
            ...updatedCall,
          };
          return newCalls;
        }
        // Add new call
        return [updatedCall, ...prevCalls];
      });
    };

    const handleNewCall = (event: CustomEvent) => {
      const newCall = event.detail;
      setCalls((prevCalls) => [newCall, ...prevCalls]);
    };

    window.addEventListener("call-updated", handleCallUpdated as EventListener);
    window.addEventListener("new-call", handleNewCall as EventListener);

    return () => {
      window.removeEventListener(
        "call-updated",
        handleCallUpdated as EventListener
      );
      window.removeEventListener("new-call", handleNewCall as EventListener);
    };
  }, []);

  const filteredCalls = calls.filter(
    (call) =>
      call.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.customerPhone.includes(searchTerm) ||
      call.intent?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calls</h1>
            <p className="text-gray-600 mt-2">
              All calls handled by your AI receptionist
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map(() => (
            <Card key={`call-skeleton-${crypto.randomUUID()}`}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
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
          <h1 className="text-3xl font-bold text-gray-900">Calls</h1>
          <p className="text-gray-600 mt-2">
            All calls handled by your AI receptionist
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Test Call Button */}
          <Button
            onClick={() => setIsCallModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <PhoneCall className="h-4 w-4 mr-2" />
            Test Call
          </Button>

          {/* WebSocket Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
          </div>

          <Input
            placeholder="Search calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calls.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                calls.filter((call) => {
                  const callDate = new Date(call.createdAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return callDate >= weekAgo;
                }).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Callers
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(calls.map((call) => call.customerPhone)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calls List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>
            {isConnected
              ? "Live updates from your AI receptionist - new calls appear in real-time"
              : "All calls handled by your AI receptionist"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCalls.length > 0 ? (
            <div className="space-y-4">
              {filteredCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {call.customerName || "Unknown"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {call.customerPhone}
                      </p>
                      {call.transcript && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {call.transcript}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge variant="secondary">
                        {call.intent || "General"}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(call.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(call.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No calls yet
              </h3>
              <p className="text-gray-600">
                {isConnected
                  ? "When customers call your business, the AI will handle them here in real-time."
                  : "When customers call your business, the AI will handle them here."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Testing Modal */}
      <CallTestingModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        businessName={session?.user?.name || "Your Business"}
        businessId={businessId || session?.user?.id || undefined}
      />
    </div>
  );
}
