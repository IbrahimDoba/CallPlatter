export type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null | undefined;
  appointmentTime: string; // ISO string format
  service: string | null;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  businessId: string;
  updatedAt: string;
  createdAt: string;
};
