"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Plus, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createAppointment } from "@/app/actions/GenerateAppointment";
import { api } from "@/lib/api";

import type { Appointment } from "@/types/appointment";
import { AppointmentDetailsSlider } from "@/components/module/Appointment/AppointmentDetailsSlider";
import { AllAppointmentsList } from "@/components/module/Appointment/View-All-Appointments";

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>>({
    customerName: "",
    customerPhone: "",
    customerEmail: null,
    appointmentTime: "",
    service: null,
    notes: null,
    status: "pending",
    businessId: session?.user?.businessId || ""
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await api.appointments.list();
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAppointments();
    }
  }, [session]);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const result = await api.appointmentsExtended.updateStatus(appointmentId, newStatus);
      
      if (result.success) {
        toast.success(`Appointment marked as ${newStatus.toLowerCase()}`);
        // Update the appointments list
        const updatedAppointments = appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } as Appointment : apt
        );
        setAppointments(updatedAppointments);
        setSelectedAppointment(prev => prev ? { ...prev, status: newStatus } as Appointment : null);
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update appointment status');
      console.error('Error updating appointment status:', error);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createAppointment({
      customerName: newAppointment.customerName,
      customerPhone: newAppointment.customerPhone,
      customerEmail: newAppointment.customerEmail || undefined,
      appointmentTime: newAppointment.appointmentTime,
      service: newAppointment.service || undefined,
      notes: newAppointment.notes || undefined,
      businessId: session?.user?.businessId || ""
    });
  
    if (result.success) {
      toast.success("Appointment created successfully");
      // Refresh appointments list
      try {
        const data = await api.appointments.list();
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error refreshing appointments:", error);
      }
      setIsDialogOpen(false);
      setNewAppointment({
        customerName: "",
        customerPhone: "",
        customerEmail: null,
        appointmentTime: "",
        service: null,
        notes: null,
        status: "pending",
        businessId: session?.user?.businessId || ""
      });
    } else {
      toast.error(result.error || "Failed to create appointment");
    }
  };

  const appointmentsForSelectedDate = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointmentTime);
    return selectedDate && 
           appointmentDate.getDate() === selectedDate.getDate() &&
           appointmentDate.getMonth() === selectedDate.getMonth() &&
           appointmentDate.getFullYear() === selectedDate.getFullYear();
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-2">
              Manage your scheduled appointments
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse"/>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {['appointment-1', 'appointment-2', 'appointment-3'].map((id) => (
                  <div key={id} className="h-16 bg-gray-200 rounded animate-pulse"/>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AppointmentDetailsSlider
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
        onStatusChange={handleStatusChange}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">
            Manage your scheduled appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* New View All Appointments Button */}
          <AllAppointmentsList 
            appointments={appointments}
            onAppointmentClick={(appointment) => setSelectedAppointment(appointment)}
          />
          
          {/* Existing New Appointment Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
                <DialogDescription>
                  Add a new appointment to your calendar
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newAppointment.customerName}
                    onChange={(e) => setNewAppointment({
                      ...newAppointment,
                      customerName: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={newAppointment.customerPhone}
                    onChange={(e) => setNewAppointment({
                      ...newAppointment,
                      customerPhone: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={newAppointment.customerEmail || ''}
                    onChange={(e) => setNewAppointment({
                      ...newAppointment,
                      customerEmail: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Appointment Time</Label>
                  <Input
                    id="appointmentTime"
                    type="datetime-local"
                    value={newAppointment.appointmentTime}
                    onChange={(e) => setNewAppointment({
                      ...newAppointment,
                      appointmentTime: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service (Optional)</Label>
                  <Input
                    id="service"
                    value={newAppointment.service || ''}
                    onChange={(e) => setNewAppointment({
                      ...newAppointment,
                      service: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newAppointment.notes || ''}
                    onChange={(e) => setNewAppointment({
                      ...newAppointment,
                      notes: e.target.value
                    })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Appointment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(appointment => {
                const appointmentDate = new Date(appointment.appointmentTime);
                const today = new Date();
                return appointmentDate.getDate() === today.getDate() &&
                       appointmentDate.getMonth() === today.getMonth() &&
                       appointmentDate.getFullYear() === today.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(appointment => {
                const appointmentDate = new Date(appointment.appointmentTime);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return appointmentDate >= weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Appointments */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              Select a date to view appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>

        {/* Appointments for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle>
              Appointments for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </CardTitle>
            <CardDescription>
              {appointmentsForSelectedDate.length} appointment(s) scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {appointmentsForSelectedDate.map((appointment) => (
                  <Card 
                    key={appointment.id} 
                    className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{appointment.customerName}</h3>
                            <Badge 
                              variant={
                                appointment.status === 'completed' 
                                  ? 'secondary' 
                                  : appointment.status === 'cancelled' 
                                    ? 'destructive' 
                                    : 'default'
                              }
                              className={
                                new Date().toDateString() === new Date(appointment.appointmentTime).toDateString() 
                                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                                  : ''
                              }
                            >
                              {appointment.status === 'completed' 
                                ? 'Completed' 
                                : appointment.status === 'cancelled' 
                                  ? 'Cancelled'
                                  : new Date().toDateString() === new Date(appointment.appointmentTime).toDateString() 
                                    ? 'Today' 
                                    : new Date(appointment.appointmentTime) < new Date() 
                                      ? 'Past' 
                                      : 'Upcoming'
                              }
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{appointment.customerPhone}</p>
                          {appointment.service && (
                            <p className="text-sm text-blue-600">{appointment.service}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(appointment.appointmentTime), "MMM d, yyyy")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(appointment.appointmentTime), "h:mm a")}
                          </p>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {appointment.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No appointments
                </h3>
                <p className="text-gray-600">
                  No appointments scheduled for this date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}