import mongoose, { Document, Schema } from 'mongoose';

interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

export interface IWorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface IProfessional extends Document {
  name: string;
  specialty: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  serviceIds: mongoose.Types.ObjectId[];
  workingHours: IWorkingHours;
  active: boolean;
  companyId?: string;
}

const DayScheduleSchema = new Schema<DaySchedule>(
  { active: { type: Boolean, default: false }, start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' } },
  { _id: false }
);

const defaultDay = { active: true, start: '09:00', end: '18:00' };
const defaultDayOff = { active: false, start: '09:00', end: '18:00' };

const ProfessionalSchema = new Schema<IProfessional>(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    bio: { type: String, trim: true },
    avatar: { type: String },
    serviceIds: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    workingHours: {
      monday:    { type: DayScheduleSchema, default: () => ({ ...defaultDay }) },
      tuesday:   { type: DayScheduleSchema, default: () => ({ ...defaultDay }) },
      wednesday: { type: DayScheduleSchema, default: () => ({ ...defaultDay }) },
      thursday:  { type: DayScheduleSchema, default: () => ({ ...defaultDay }) },
      friday:    { type: DayScheduleSchema, default: () => ({ ...defaultDay }) },
      saturday:  { type: DayScheduleSchema, default: () => ({ ...defaultDayOff }) },
      sunday:    { type: DayScheduleSchema, default: () => ({ ...defaultDayOff }) },
    },
    active: { type: Boolean, default: true },
    companyId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProfessional>('Professional', ProfessionalSchema);
