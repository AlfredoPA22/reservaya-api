import mongoose, { Document, Schema } from 'mongoose';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'EF-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export interface IAppointment extends Document {
  code: string;
  clientId: mongoose.Types.ObjectId;
  professionalId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  date: string;      // "YYYY-MM-DD"
  timeSlot: string;  // "HH:mm"
  status: AppointmentStatus;
  notes?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  companyId?: string;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    code: { type: String, unique: true, default: generateCode },
    clientId: { type: Schema.Types.ObjectId, ref: 'User' },
    professionalId: { type: Schema.Types.ObjectId, ref: 'Professional', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: { type: String },
    clientName: { type: String },
    clientPhone: { type: String },
    clientEmail: { type: String },
    companyId: { type: String },
  },
  { timestamps: true }
);

// Índice para evitar doble reserva
AppointmentSchema.index(
  { professionalId: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ['cancelled'] } } }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
