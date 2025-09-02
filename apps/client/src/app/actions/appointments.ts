'use server';

import { db } from "@repo/db";

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  try {
    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
    
    return { 
      success: true, 
      data: updatedAppointment 
    };
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return { 
      success: false, 
      error: 'Failed to update appointment status' 
    };
  }
}
