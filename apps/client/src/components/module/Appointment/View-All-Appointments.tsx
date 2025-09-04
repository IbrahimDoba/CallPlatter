import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  Search, 
  Filter,
  ChevronRight,
  List,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import type { Appointment } from "@/types/appointment";

interface AllAppointmentsListProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function AllAppointmentsList({ appointments, onAppointmentClick }: AllAppointmentsListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return {
          icon: CheckCircle2,
          color: "text-green-600 bg-green-50 border-green-200",
          label: "Confirmed"
        };
      case "COMPLETED":
        return {
          icon: CheckCircle2,
          color: "text-blue-600 bg-blue-50 border-blue-200",
          label: "Completed"
        };
      case "CANCELLED":
        return {
          icon: XCircle,
          color: "text-red-600 bg-red-50 border-red-200",
          label: "Cancelled"
        };
      case "PENDING":
      default:
        return {
          icon: AlertTriangle,
          color: "text-amber-600 bg-amber-50 border-amber-200",
          label: "Pending"
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeDistance = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      if (date > now) {
        return `in ${Math.ceil(diffInHours)}h`;
      }
      return `${Math.ceil(diffInHours)}h ago`;
    }
    
    const diffInDays = Math.ceil(diffInHours / 24);
    if (date > now) {
      return `in ${diffInDays}d`;
    }
    return `${diffInDays}d ago`;
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customerPhone.includes(searchTerm) ||
      (appointment.customerEmail && appointment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.service && appointment.service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || appointment.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const sortedAppointments = filteredAppointments.sort((a, b) => 
    new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime()
  );

  const handleAppointmentClick = (appointment: Appointment) => {
    onAppointmentClick(appointment);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <List className="h-4 w-4 mr-2" />
          View All Appointments
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-3xl !w-[85vw] max-h-[90vh] h-[85vh] flex flex-col sm:!max-w-5xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            All Appointments ({appointments.length})
          </DialogTitle>
          <DialogDescription>
            View and manage all your scheduled appointments
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 py-3 border-b flex-shrink-0">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, phone, email, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {sortedAppointments.length > 0 ? (
            <div className="space-y-2 pr-2">
              {sortedAppointments.map((appointment) => {
                const statusConfig = getStatusConfig(appointment.status);
                const StatusIcon = statusConfig.icon;
                const isUpcoming = new Date(appointment.appointmentTime) > new Date();

                return (
                  <Card 
                    key={appointment.id}
                    className="hover:shadow-sm hover:border-primary/30 transition-all duration-200 cursor-pointer border-l-2 border-l-primary/20 hover:border-l-primary"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-medium text-sm truncate">{appointment.customerName}</h3>
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${statusConfig.color} flex-shrink-0`}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              <span className="font-medium text-xs">{statusConfig.label}</span>
                            </div>
                            {isUpcoming && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                                Upcoming
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(appointment.appointmentTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(appointment.appointmentTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span className="truncate max-w-24">{appointment.customerPhone}</span>
                            </div>
                            {appointment.customerEmail && (
                              <div className="flex items-center gap-1 min-w-0">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate text-xs">{appointment.customerEmail}</span>
                              </div>
                            )}
                            {appointment.service && (
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-primary/20 flex-shrink-0" />
                                <span className="truncate text-xs">{appointment.service}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">
                              {getTimeDistance(appointment.appointmentTime)}
                            </span>
                            {appointment.notes && (
                              <span className="text-xs text-muted-foreground italic">
                                Has notes
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-3 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "No matching appointments" : "No appointments found"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't created any appointments yet."
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-3 flex justify-between items-center text-sm text-muted-foreground flex-shrink-0">
          <span>
            Showing {sortedAppointments.length} of {appointments.length} appointments
          </span>
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}