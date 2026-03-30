import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  description?: string;
  price: number;
  duration: number; // minutos
  active: boolean;
  companyId?: string;
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 15 }, // minutos
    active: { type: Boolean, default: true },
    companyId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IService>('Service', ServiceSchema);
