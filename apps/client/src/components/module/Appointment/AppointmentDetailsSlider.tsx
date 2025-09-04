import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  MapPin, 
  AlertCircle, 
  Clock,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import type { Appointment } from "@/types/appointment";

interface AppointmentDetailsSliderProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onStatusChange?: (appointmentId: string, newStatus: Appointment["status"]) => void;
}

export function AppointmentDetailsSlider({
  isOpen,
  onClose,
  appointment,
  onStatusChange,
}: AppointmentDetailsSliderProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!appointment) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return {
          variant: "default" as const,
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50 border-green-200",
          label: "Confirmed"
        };
      case "COMPLETED":
        return {
          variant: "secondary" as const,
          icon: CheckCircle2,
          color: "text-blue-600",
          bg: "bg-blue-50 border-blue-200",
          label: "Completed"
        };
      case "CANCELLED":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-50 border-red-200",
          label: "Cancelled"
        };
      case "PENDING":
      default:
        return {
          variant: "outline" as const,
          icon: AlertTriangle,
          color: "text-amber-600",
          bg: "bg-amber-50 border-amber-200",
          label: "Pending"
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = async (newStatus: Appointment["status"]) => {
    if (!onStatusChange) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(appointment.id, newStatus);
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatPhoneForCall = (phone: string) => {
    return `tel:${phone.replace(/\D/g, '')}`;
  };

  const formatEmailForMail = (email: string) => {
    return `mailto:${email}`;
  };

  const isUpcoming = new Date(appointment.appointmentTime) > new Date();
  const timeUntil = isUpcoming 
    ? formatDistanceToNow(new Date(appointment.appointmentTime), { addSuffix: true })
    : formatDistanceToNow(new Date(appointment.appointmentTime), { addSuffix: true });

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full lg:min-w-[850px] max-w-[95vw] ml-auto mt-0 rounded-l-xl shadow-2xl border-l-2">
        <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20">
          {/* Enhanced Header */}
          <DrawerHeader className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
              
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <DrawerTitle className="text-lg font-semibold text-left truncate">
                    {appointment.customerName || 'Appointment Details'}
                  </DrawerTitle>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${statusConfig.bg}`}>
                    <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                    <span className={`font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
                <DrawerDescription className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-3 w-3" />
                  <span className={isUpcoming ? "text-foreground font-medium" : ""}>
                    {timeUntil}
                  </span>
                  {isUpcoming && (
                    <Badge variant="secondary" className="ml-1 text-xs px-2 py-0">
                      Upcoming
                    </Badge>
                  )}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          {/* Enhanced Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-6">
              {/* Date & Time Card */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-md bg-orange-100">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-base font-semibold">Appointment Time</h3>
                </div>
                <div className="text-lg font-semibold text-foreground mb-0.5">
                  {format(new Date(appointment.appointmentTime), "EEEE, MMMM d")}
                </div>
                <div className="text-base text-muted-foreground">
                  {format(new Date(appointment.appointmentTime), "h:mm a")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(appointment.appointmentTime), "yyyy")}
                </div>
              </div>

              {/* Service Information */}
              {appointment.service && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Service Details
                  </h3>
                  <div className="bg-card border rounded-lg p-3">
                    <p className="font-medium">{appointment.service}</p>
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Customer Information
                </h3>
                <div className="bg-card border rounded-lg divide-y">
                  {/* Name */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-blue-50">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="font-medium text-sm">{appointment.customerName || 'Not provided'}</p>
                      </div>
                    </div>
                    {appointment.customerName && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => copyToClipboard(appointment.customerName!, 'name')}
                      >
                        {copiedField === 'name' ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-green-50">
                        <Phone className="h-3 w-3 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                        <p className="font-medium text-sm">{appointment.customerPhone || 'Not provided'}</p>
                      </div>
                    </div>
                    {appointment.customerPhone && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(appointment.customerPhone!, 'phone')}
                        >
                          {copiedField === 'phone' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          asChild
                        >
                          <a href={formatPhoneForCall(appointment.customerPhone)}>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  {appointment.customerEmail && (
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-purple-50">
                          <Mail className="h-3 w-3 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">Email Address</p>
                          <p className="font-medium text-sm truncate">{appointment.customerEmail}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(appointment.customerEmail!, 'email')}
                        >
                          {copiedField === 'email' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          asChild
                        >
                          <a href={formatEmailForMail(appointment.customerEmail)}>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-muted-foreground" />
                    Additional Notes
                  </h3>
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-dashed border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm whitespace-pre-line leading-relaxed">{appointment.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Status Actions - Fixed at bottom */}
            <div className="border-t bg-background/80 backdrop-blur-sm p-4">
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Update Status</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { status: "PENDING", label: "Pending", icon: AlertTriangle, color: "hover:bg-amber-50 hover:border-amber-200" },
                    { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle2, color: "hover:bg-green-50 hover:border-green-200" },
                    { status: "COMPLETED", label: "Completed", icon: CheckCircle2, color: "hover:bg-blue-50 hover:border-blue-200" },
                    { status: "CANCELLED", label: "Cancelled", icon: XCircle, color: "hover:bg-red-50 hover:border-red-200" },
                  ].map(({ status, label, icon: Icon, color }) => (
                    <Button
                      key={status}
                      variant={appointment.status === status ? "default" : "outline"}
                      className={`h-auto p-2 flex-col gap-1 transition-all ${appointment.status !== status ? color : ''}`}
                      disabled={isUpdating || appointment.status === status}
                      onClick={() => handleStatusChange(status as Appointment["status"])}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Icon className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}