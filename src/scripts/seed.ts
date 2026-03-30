/**
 * Seed completo para barbería "El Filo"
 * Cubre todos los casos: servicios activos/inactivos, profesionales activos/inactivos,
 * turnos con cliente registrado y guest, todos los estados, rango amplio de fechas.
 * Uso: npx ts-node src/scripts/seed.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import Service from '../models/Service';
import Professional from '../models/Professional';
import Appointment from '../models/Appointment';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-reservas';

// ─── Servicios ─────────────────────────────────────────────────────────────────
// 8 activos + 2 inactivos (discontinuados)
const SERVICES_ACTIVE = [
  { name: 'Corte clásico',          description: 'Corte a tijera o máquina con terminación prolija',      price: 2500, duration: 30, active: true },
  { name: 'Barba completa',          description: 'Perfilado, afeitado y aceite de barba',                 price: 1800, duration: 25, active: true },
  { name: 'Corte + barba',           description: 'El combo completo, corte de cabello y arreglo de barba',price: 3800, duration: 50, active: true },
  { name: 'Corte niños (hasta 12)',  description: 'Corte especial para los más chicos',                    price: 1800, duration: 25, active: true },
  { name: 'Fade / degradé',          description: 'Corte degradado con fade americano o europeo',          price: 3000, duration: 40, active: true },
  { name: 'Diseño de cejas',         description: 'Perfilado y diseño de cejas con pinza y navaja',        price: 1200, duration: 20, active: true },
  { name: 'Tratamiento capilar',     description: 'Hidratación profunda + masaje + secado',                price: 4500, duration: 60, active: true },
  { name: 'Afeitado clásico navaja', description: 'Afeitado tradicional con toalla caliente y navaja',     price: 2200, duration: 35, active: true },
];

const SERVICES_INACTIVE = [
  { name: 'Coloración para hombre', description: 'Servicio discontinuado por falta de demanda', price: 5500, duration: 90, active: false },
  { name: 'Extensiones capilares',  description: 'Servicio discontinuado',                       price: 8000, duration: 120, active: false },
];

// ─── Profesionales ─────────────────────────────────────────────────────────────
// 5 activos (1 recién incorporado con pocos servicios) + 1 inactivo (se fue)
const PROFESSIONALS_DATA = [
  {
    name: 'Martín Sosa', specialty: 'Barbero Senior',
    phone: '+54 11 4567-8901',
    bio: 'Más de 10 años en el rubro. Especialista en fades y cortes clásicos.',
    active: true,
    workingHours: {
      monday:    { active: true,  start: '09:00', end: '19:00' },
      tuesday:   { active: true,  start: '09:00', end: '19:00' },
      wednesday: { active: true,  start: '09:00', end: '19:00' },
      thursday:  { active: true,  start: '09:00', end: '19:00' },
      friday:    { active: true,  start: '09:00', end: '19:00' },
      saturday:  { active: true,  start: '09:00', end: '14:00' },
      sunday:    { active: false, start: '09:00', end: '14:00' },
    },
  },
  {
    name: 'Diego Ramírez', specialty: 'Barbero & Estilista',
    phone: '+54 11 4567-8902',
    bio: 'Especializado en diseños modernos, degradés y coloración para hombre.',
    active: true,
    workingHours: {
      monday:    { active: false, start: '10:00', end: '19:00' },
      tuesday:   { active: true,  start: '10:00', end: '19:00' },
      wednesday: { active: true,  start: '10:00', end: '19:00' },
      thursday:  { active: true,  start: '10:00', end: '19:00' },
      friday:    { active: true,  start: '10:00', end: '20:00' },
      saturday:  { active: true,  start: '09:00', end: '16:00' },
      sunday:    { active: false, start: '09:00', end: '14:00' },
    },
  },
  {
    name: 'Lucía Fernández', specialty: 'Estilista & Tricóloga',
    phone: '+54 11 4567-8903',
    bio: 'Especialista en tratamientos capilares y técnicas de coloración avanzada.',
    active: true,
    workingHours: {
      monday:    { active: true,  start: '09:00', end: '18:00' },
      tuesday:   { active: true,  start: '09:00', end: '18:00' },
      wednesday: { active: false, start: '09:00', end: '18:00' },
      thursday:  { active: true,  start: '09:00', end: '18:00' },
      friday:    { active: true,  start: '09:00', end: '18:00' },
      saturday:  { active: true,  start: '10:00', end: '15:00' },
      sunday:    { active: false, start: '09:00', end: '14:00' },
    },
  },
  {
    name: 'Carlos Blanco', specialty: 'Barbero Clásico',
    phone: '+54 11 4567-8904',
    bio: 'Maestro del afeitado clásico con navaja. 15 años de experiencia.',
    active: true,
    workingHours: {
      monday:    { active: true,  start: '08:00', end: '17:00' },
      tuesday:   { active: true,  start: '08:00', end: '17:00' },
      wednesday: { active: true,  start: '08:00', end: '17:00' },
      thursday:  { active: true,  start: '08:00', end: '17:00' },
      friday:    { active: true,  start: '08:00', end: '17:00' },
      saturday:  { active: false, start: '09:00', end: '14:00' },
      sunday:    { active: false, start: '09:00', end: '14:00' },
    },
  },
  {
    // Recién incorporado — solo hace cortes básicos por ahora
    name: 'Valentina Ríos', specialty: 'Barbera Junior',
    phone: '+54 11 4567-8905',
    bio: 'Recién egresada. Especializada en cortes modernos y diseño de cejas.',
    active: true,
    workingHours: {
      monday:    { active: true,  start: '10:00', end: '18:00' },
      tuesday:   { active: true,  start: '10:00', end: '18:00' },
      wednesday: { active: true,  start: '10:00', end: '18:00' },
      thursday:  { active: true,  start: '10:00', end: '18:00' },
      friday:    { active: true,  start: '10:00', end: '18:00' },
      saturday:  { active: false, start: '09:00', end: '14:00' },
      sunday:    { active: false, start: '09:00', end: '14:00' },
    },
  },
  {
    // Inactivo — se fue de la barbería
    name: 'Roberto Pereyra', specialty: 'Barbero',
    phone: '+54 11 4567-8906',
    bio: 'Ex empleado.',
    active: false,
    workingHours: {
      monday:    { active: true,  start: '09:00', end: '17:00' },
      tuesday:   { active: true,  start: '09:00', end: '17:00' },
      wednesday: { active: true,  start: '09:00', end: '17:00' },
      thursday:  { active: true,  start: '09:00', end: '17:00' },
      friday:    { active: true,  start: '09:00', end: '17:00' },
      saturday:  { active: false, start: '09:00', end: '14:00' },
      sunday:    { active: false, start: '09:00', end: '14:00' },
    },
  },
];

// ─── Clientes ─────────────────────────────────────────────────────────────────
const CLIENTS = [
  { name: 'Juan García',      email: 'juan@demo.com',    password: 'cliente123', phone: '+54 11 5555-0001' },
  { name: 'Pedro Martínez',   email: 'pedro@demo.com',   password: 'cliente123', phone: '+54 11 5555-0002' },
  { name: 'Sebastián López',  email: 'seba@demo.com',    password: 'cliente123', phone: '+54 11 5555-0003' },
  { name: 'Lucas Torres',     email: 'lucas@demo.com',   password: 'cliente123', phone: '+54 11 5555-0004' },
  { name: 'Agustín Díaz',     email: 'agus@demo.com',    password: 'cliente123', phone: '+54 11 5555-0005' },
  { name: 'Matías Romero',    email: 'matias@demo.com',  password: 'cliente123', phone: '+54 11 5555-0006' },
  { name: 'Facundo Morales',  email: 'facu@demo.com',    password: 'cliente123', phone: '+54 11 5555-0007' },
  { name: 'Nicolás Álvarez',  email: 'nico@demo.com',    password: 'cliente123', phone: '+54 11 5555-0008' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function relDate(days: number, hhmm: string): { date: string; timeSlot: string } {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return { date: d.toISOString().split('T')[0], timeSlot: hhmm };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Service.deleteMany({}),
    Professional.deleteMany({}),
    Appointment.deleteMany({}),
  ]);
  console.log('Base de datos limpiada');

  // ── Admin ──────────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin El Filo', email: 'admin@elfilo.com',
    password: 'admin123', role: 'admin', phone: '+54 11 4000-0000',
  });
  console.log(`Admin creado: ${admin.email}`);

  // ── Clientes ───────────────────────────────────────────────────────────────
  const clients = await User.insertMany(CLIENTS.map((c) => ({ ...c, role: 'client' })));
  console.log(`${clients.length} clientes creados`);

  // ── Servicios ──────────────────────────────────────────────────────────────
  const servicesActive   = await Service.insertMany(SERVICES_ACTIVE);
  const servicesInactive = await Service.insertMany(SERVICES_INACTIVE);
  console.log(`${servicesActive.length} servicios activos + ${servicesInactive.length} inactivos creados`);

  // ── Profesionales ─────────────────────────────────────────────────────────
  const professionals = await Professional.insertMany(PROFESSIONALS_DATA);
  console.log(`${professionals.length} profesionales creados (5 activos + 1 inactivo)`);

  // Alias cortos
  const [martin, diego, lucia, carlos, valentina, roberto] = professionals;
  const [corteClasico, barba, corteBarba, corteNinos, fade, cejas, tratamiento, afeitado] = servicesActive;
  const [juan, pedro, seba, lucas, agus, matias, facu, nico] = clients;

  // ── Asignación de servicios ────────────────────────────────────────────────
  // Martín: el que más servicios hace (barbero completo)
  await Professional.findByIdAndUpdate(martin._id, {
    serviceIds: [corteClasico._id, barba._id, corteBarba._id, corteNinos._id, fade._id],
  });
  // Diego: fades, combos, cejas
  await Professional.findByIdAndUpdate(diego._id, {
    serviceIds: [corteClasico._id, corteBarba._id, fade._id, cejas._id],
  });
  // Lucía: especialista en tratamientos
  await Professional.findByIdAndUpdate(lucia._id, {
    serviceIds: [tratamiento._id, cejas._id],
  });
  // Carlos: clásico (barba, afeitado, cortes)
  await Professional.findByIdAndUpdate(carlos._id, {
    serviceIds: [barba._id, afeitado._id, corteClasico._id, corteBarba._id],
  });
  // Valentina: recién incorporada — solo cortes básicos y cejas
  await Professional.findByIdAndUpdate(valentina._id, {
    serviceIds: [corteClasico._id, corteNinos._id, cejas._id],
  });
  // Roberto (inactivo): sin servicios asignados — ya no trabaja acá
  console.log('Servicios asignados a profesionales');

  // ── Turnos ─────────────────────────────────────────────────────────────────
  // Cubren: todos los estados, clientes registrados y guests, rango 2 meses atrás → 1 mes adelante
  // Guests sin teléfono, guests con teléfono, mismos clientes en distintos profesionales

  const appointments = [

    // ══ Hace 2 meses ══════════════════════════════════════════════════════════
    { ...relDate(-60, '09:00'), professionalId: martin._id, serviceId: corteClasico._id, clientId: juan._id,   status: 'completed' },
    { ...relDate(-60, '09:30'), professionalId: carlos._id, serviceId: afeitado._id,     clientId: pedro._id,  status: 'completed' },
    { ...relDate(-60, '10:00'), professionalId: diego._id,  serviceId: fade._id,          clientId: seba._id,   status: 'completed' },
    { ...relDate(-60, '10:30'), professionalId: lucia._id,  serviceId: tratamiento._id,   clientId: agus._id,   status: 'completed' },
    { ...relDate(-60, '11:00'), professionalId: martin._id, serviceId: corteBarba._id,    clientId: lucas._id,  status: 'completed' },
    { ...relDate(-60, '11:30'), professionalId: diego._id,  serviceId: corteClasico._id,  clientId: matias._id, status: 'cancelled' },
    { ...relDate(-60, '14:00'), professionalId: carlos._id, serviceId: barba._id,          clientId: facu._id,   status: 'completed' },
    { ...relDate(-60, '14:30'), professionalId: martin._id, serviceId: fade._id,           clientId: nico._id,   status: 'completed' },
    // Guest sin teléfono
    { ...relDate(-60, '15:00'), professionalId: diego._id,  serviceId: cejas._id,
      clientName: 'Analía Vega', clientEmail: 'analia@gmail.com', status: 'completed' },
    // Roberto (inactivo) — tiene historial de cuando trabajaba
    { ...relDate(-60, '09:00'), professionalId: roberto._id, serviceId: corteClasico._id, clientId: juan._id,   status: 'completed' },
    { ...relDate(-60, '09:30'), professionalId: roberto._id, serviceId: barba._id,         clientId: seba._id,   status: 'completed' },

    // ══ Hace 1 mes y medio ═══════════════════════════════════════════════════
    { ...relDate(-45, '09:00'), professionalId: martin._id, serviceId: corteClasico._id,  clientId: pedro._id,  status: 'completed' },
    { ...relDate(-45, '09:30'), professionalId: carlos._id, serviceId: afeitado._id,       clientId: lucas._id,  status: 'completed' },
    { ...relDate(-45, '10:00'), professionalId: diego._id,  serviceId: corteBarba._id,     clientId: juan._id,   status: 'completed' },
    { ...relDate(-45, '10:30'), professionalId: lucia._id,  serviceId: cejas._id,           clientId: agus._id,   status: 'completed' },
    { ...relDate(-45, '11:00'), professionalId: martin._id, serviceId: fade._id,            clientId: nico._id,   status: 'completed' },
    { ...relDate(-45, '11:30'), professionalId: diego._id,  serviceId: fade._id,            clientId: matias._id, status: 'cancelled' },
    { ...relDate(-45, '14:00'), professionalId: carlos._id, serviceId: barba._id,            clientId: facu._id,   status: 'completed' },
    { ...relDate(-45, '15:00'), professionalId: roberto._id, serviceId: corteClasico._id,   clientId: pedro._id,  status: 'cancelled' },

    // ══ Hace 1 mes ════════════════════════════════════════════════════════════
    { ...relDate(-30, '09:00'), professionalId: martin._id,  serviceId: corteBarba._id,    clientId: seba._id,    status: 'completed' },
    { ...relDate(-30, '09:50'), professionalId: martin._id,  serviceId: corteClasico._id,  clientId: pedro._id,   status: 'completed' },
    { ...relDate(-30, '10:00'), professionalId: diego._id,   serviceId: fade._id,           clientId: lucas._id,   status: 'completed' },
    { ...relDate(-30, '10:40'), professionalId: diego._id,   serviceId: corteBarba._id,     clientId: matias._id,  status: 'completed' },
    { ...relDate(-30, '09:00'), professionalId: lucia._id,   serviceId: tratamiento._id,    clientId: agus._id,    status: 'completed' },
    { ...relDate(-30, '10:00'), professionalId: lucia._id,   serviceId: cejas._id,           clientId: facu._id,    status: 'completed' },
    { ...relDate(-30, '08:00'), professionalId: carlos._id,  serviceId: afeitado._id,       clientId: nico._id,    status: 'completed' },
    { ...relDate(-30, '08:35'), professionalId: carlos._id,  serviceId: barba._id,           clientId: juan._id,    status: 'completed' },
    // Guest con teléfono
    { ...relDate(-30, '15:00'), professionalId: martin._id,  serviceId: corteNinos._id,
      clientName: 'Roberto Suárez', clientEmail: 'roberto@gmail.com', clientPhone: '+54 11 5555-1234', status: 'completed' },
    // Roberto todavía activo
    { ...relDate(-30, '09:00'), professionalId: roberto._id, serviceId: barba._id,          clientId: juan._id,    status: 'completed' },
    { ...relDate(-30, '09:35'), professionalId: roberto._id, serviceId: corteClasico._id,   clientId: nico._id,    status: 'completed' },

    // ══ Hace 3 semanas ════════════════════════════════════════════════════════
    { ...relDate(-21, '09:00'), professionalId: martin._id, serviceId: corteClasico._id,  clientId: juan._id,    status: 'completed' },
    { ...relDate(-21, '09:30'), professionalId: carlos._id, serviceId: afeitado._id,       clientId: pedro._id,   status: 'completed' },
    { ...relDate(-21, '10:00'), professionalId: diego._id,  serviceId: fade._id,           clientId: seba._id,    status: 'completed' },
    { ...relDate(-21, '10:30'), professionalId: lucia._id,  serviceId: tratamiento._id,    clientId: agus._id,    status: 'completed' },
    { ...relDate(-21, '11:00'), professionalId: martin._id, serviceId: corteBarba._id,     clientId: lucas._id,   status: 'completed' },
    { ...relDate(-21, '11:30'), professionalId: diego._id,  serviceId: corteClasico._id,   clientId: matias._id,  status: 'cancelled' },
    { ...relDate(-21, '14:00'), professionalId: carlos._id, serviceId: barba._id,           clientId: facu._id,    status: 'completed' },
    { ...relDate(-21, '14:30'), professionalId: martin._id, serviceId: fade._id,            clientId: nico._id,    status: 'completed' },
    // Valentina empieza a tener turnos
    { ...relDate(-21, '10:00'), professionalId: valentina._id, serviceId: corteClasico._id, clientId: juan._id,   status: 'completed' },
    { ...relDate(-21, '11:00'), professionalId: valentina._id, serviceId: cejas._id,
      clientName: 'Camila Suárez', clientEmail: 'camila@gmail.com', status: 'completed' },

    // ══ Hace 2 semanas ════════════════════════════════════════════════════════
    { ...relDate(-14, '09:00'), professionalId: martin._id,    serviceId: corteClasico._id, clientId: pedro._id,   status: 'completed' },
    { ...relDate(-14, '09:30'), professionalId: diego._id,     serviceId: corteBarba._id,   clientId: juan._id,    status: 'completed' },
    { ...relDate(-14, '10:00'), professionalId: lucia._id,     serviceId: cejas._id,         clientId: agus._id,    status: 'completed' },
    { ...relDate(-14, '10:30'), professionalId: carlos._id,    serviceId: afeitado._id,      clientId: seba._id,    status: 'completed' },
    { ...relDate(-14, '11:00'), professionalId: martin._id,    serviceId: fade._id,           clientId: lucas._id,   status: 'completed' },
    { ...relDate(-14, '11:30'), professionalId: diego._id,     serviceId: fade._id,           clientId: matias._id,  status: 'completed' },
    { ...relDate(-14, '14:00'), professionalId: lucia._id,     serviceId: tratamiento._id,    clientId: facu._id,    status: 'completed' },
    { ...relDate(-14, '14:30'), professionalId: carlos._id,    serviceId: barba._id,           clientId: nico._id,    status: 'completed' },
    // Guest sin teléfono (solo nombre y email)
    { ...relDate(-14, '15:00'), professionalId: martin._id,    serviceId: corteNinos._id,
      clientName: 'Hugo Roldán', clientEmail: 'hugo@gmail.com', status: 'completed' },
    // Mismo cliente canceló y volvió a pedir
    { ...relDate(-14, '15:30'), professionalId: diego._id,     serviceId: corteClasico._id, clientId: juan._id,    status: 'cancelled' },
    { ...relDate(-13, '11:00'), professionalId: diego._id,     serviceId: corteClasico._id, clientId: juan._id,    status: 'completed' },
    // Valentina
    { ...relDate(-14, '10:00'), professionalId: valentina._id, serviceId: corteClasico._id, clientId: seba._id,    status: 'completed' },
    { ...relDate(-14, '11:30'), professionalId: valentina._id, serviceId: corteNinos._id,
      clientName: 'Sofía Benítez', clientEmail: 'sofia@gmail.com', clientPhone: '+54 11 5555-7788', status: 'cancelled' },

    // ══ La semana pasada ═════════════════════════════════════════════════════
    { ...relDate(-7, '09:00'), professionalId: martin._id,    serviceId: corteBarba._id,    clientId: seba._id,    status: 'completed' },
    { ...relDate(-7, '09:50'), professionalId: martin._id,    serviceId: corteClasico._id,  clientId: pedro._id,   status: 'completed' },
    { ...relDate(-7, '10:00'), professionalId: diego._id,     serviceId: fade._id,           clientId: lucas._id,   status: 'completed' },
    { ...relDate(-7, '10:40'), professionalId: diego._id,     serviceId: corteBarba._id,     clientId: matias._id,  status: 'completed' },
    { ...relDate(-7, '09:00'), professionalId: lucia._id,     serviceId: tratamiento._id,    clientId: agus._id,    status: 'completed' },
    { ...relDate(-7, '10:00'), professionalId: lucia._id,     serviceId: cejas._id,           clientId: facu._id,    status: 'completed' },
    { ...relDate(-7, '08:00'), professionalId: carlos._id,    serviceId: afeitado._id,       clientId: nico._id,    status: 'completed' },
    { ...relDate(-7, '08:35'), professionalId: carlos._id,    serviceId: barba._id,           clientId: juan._id,    status: 'completed' },
    // Guest con teléfono
    { ...relDate(-7, '09:10'), professionalId: carlos._id,    serviceId: afeitado._id,
      clientName: 'Héctor Paz', clientEmail: 'hector@gmail.com', clientPhone: '+54 11 5555-3344', status: 'completed' },
    // Valentina — creciendo en turnos
    { ...relDate(-7, '10:00'), professionalId: valentina._id, serviceId: corteClasico._id,  clientId: juan._id,    status: 'completed' },
    { ...relDate(-7, '10:30'), professionalId: valentina._id, serviceId: cejas._id,
      clientName: 'Florencia Nava', clientEmail: 'flor@gmail.com', status: 'completed' },

    // ══ Ayer ═════════════════════════════════════════════════════════════════
    { ...relDate(-1, '09:00'), professionalId: martin._id,    serviceId: corteClasico._id,  clientId: juan._id,    status: 'completed' },
    { ...relDate(-1, '09:30'), professionalId: martin._id,    serviceId: barba._id,          clientId: pedro._id,   status: 'completed' },
    { ...relDate(-1, '10:30'), professionalId: diego._id,     serviceId: fade._id,           clientId: seba._id,    status: 'completed' },
    { ...relDate(-1, '11:10'), professionalId: diego._id,     serviceId: corteClasico._id,   clientId: matias._id,  status: 'completed' },
    { ...relDate(-1, '09:00'), professionalId: lucia._id,     serviceId: tratamiento._id,    clientId: agus._id,    status: 'completed' },
    { ...relDate(-1, '10:00'), professionalId: lucia._id,     serviceId: cejas._id,           clientId: facu._id,    status: 'completed' },
    { ...relDate(-1, '08:00'), professionalId: carlos._id,    serviceId: afeitado._id,       clientId: lucas._id,   status: 'completed' },
    { ...relDate(-1, '08:35'), professionalId: carlos._id,    serviceId: afeitado._id,
      clientName: 'Ramón Villalba', clientEmail: 'ramon@gmail.com', status: 'completed' },
    { ...relDate(-1, '10:00'), professionalId: valentina._id, serviceId: corteClasico._id,   clientId: nico._id,    status: 'completed' },
    { ...relDate(-1, '11:00'), professionalId: valentina._id, serviceId: corteNinos._id,
      clientName: 'Tomás Aguirre', clientEmail: 'tomas@gmail.com', clientPhone: '+54 11 5555-9999', status: 'completed' },

    // ══ Hoy ══════════════════════════════════════════════════════════════════
    // Confirmados (ya tienen turno asegurado)
    { ...relDate(0, '09:00'), professionalId: martin._id,    serviceId: corteBarba._id,    clientId: juan._id,    status: 'confirmed' },
    { ...relDate(0, '09:50'), professionalId: martin._id,    serviceId: corteClasico._id,  clientId: pedro._id,   status: 'confirmed' },
    { ...relDate(0, '10:00'), professionalId: diego._id,     serviceId: fade._id,           clientId: lucas._id,   status: 'confirmed' },
    { ...relDate(0, '10:40'), professionalId: diego._id,     serviceId: corteBarba._id,     clientId: matias._id,  status: 'confirmed' },
    { ...relDate(0, '09:00'), professionalId: lucia._id,     serviceId: tratamiento._id,    clientId: agus._id,    status: 'confirmed' },
    { ...relDate(0, '08:00'), professionalId: carlos._id,    serviceId: afeitado._id,       clientId: juan._id,    status: 'confirmed' },
    // Pendientes (aún no confirmados)
    { ...relDate(0, '10:20'), professionalId: martin._id,    serviceId: fade._id,           clientId: seba._id,    status: 'pending' },
    { ...relDate(0, '11:30'), professionalId: diego._id,     serviceId: corteClasico._id,   clientId: facu._id,    status: 'pending' },
    { ...relDate(0, '10:00'), professionalId: lucia._id,     serviceId: cejas._id,           clientId: nico._id,    status: 'pending' },
    { ...relDate(0, '08:35'), professionalId: carlos._id,    serviceId: barba._id,
      clientName: 'Gonzalo Reyes', clientEmail: 'gonza@gmail.com', clientPhone: '+54 11 5555-8765', status: 'pending' },
    // Valentina — su primer día con turno pendiente
    { ...relDate(0, '10:00'), professionalId: valentina._id, serviceId: corteClasico._id,   clientId: pedro._id,   status: 'confirmed' },
    { ...relDate(0, '11:00'), professionalId: valentina._id, serviceId: corteNinos._id,
      clientName: 'Tomás Aguirre', clientEmail: 'tomas@gmail.com', clientPhone: '+54 11 5555-9999', status: 'pending' },

    // ══ Mañana ═══════════════════════════════════════════════════════════════
    { ...relDate(1, '09:00'), professionalId: martin._id,    serviceId: corteClasico._id,  clientId: seba._id,    status: 'confirmed' },
    { ...relDate(1, '09:30'), professionalId: martin._id,    serviceId: barba._id,          clientId: lucas._id,   status: 'pending' },
    { ...relDate(1, '10:00'), professionalId: diego._id,     serviceId: fade._id,           clientId: matias._id,  status: 'confirmed' },
    { ...relDate(1, '10:40'), professionalId: diego._id,     serviceId: corteBarba._id,     clientId: facu._id,    status: 'pending' },
    { ...relDate(1, '09:00'), professionalId: lucia._id,     serviceId: tratamiento._id,
      clientName: 'Valeria Cruz', clientEmail: 'valeria@gmail.com', status: 'confirmed' },
    { ...relDate(1, '08:00'), professionalId: carlos._id,    serviceId: afeitado._id,       clientId: nico._id,    status: 'confirmed' },
    { ...relDate(1, '10:00'), professionalId: valentina._id, serviceId: corteClasico._id,   clientId: agus._id,    status: 'pending' },

    // ══ En 3 días ════════════════════════════════════════════════════════════
    { ...relDate(3, '09:00'), professionalId: martin._id,    serviceId: corteBarba._id,    clientId: juan._id,    status: 'pending' },
    { ...relDate(3, '09:50'), professionalId: martin._id,    serviceId: fade._id,           clientId: pedro._id,   status: 'pending' },
    { ...relDate(3, '10:00'), professionalId: diego._id,     serviceId: corteClasico._id,   clientId: seba._id,    status: 'confirmed' },
    { ...relDate(3, '10:30'), professionalId: lucia._id,     serviceId: cejas._id,           clientId: agus._id,    status: 'pending' },
    { ...relDate(3, '08:00'), professionalId: carlos._id,    serviceId: afeitado._id,       clientId: lucas._id,   status: 'confirmed' },
    // Guest para turno futuro
    { ...relDate(3, '11:00'), professionalId: valentina._id, serviceId: corteNinos._id,
      clientName: 'Mateo Ríos', clientEmail: 'mateo@gmail.com', clientPhone: '+54 11 5555-4455', status: 'pending' },

    // ══ En una semana ════════════════════════════════════════════════════════
    { ...relDate(7, '09:00'), professionalId: martin._id,    serviceId: corteClasico._id,  clientId: matias._id,  status: 'pending' },
    { ...relDate(7, '09:40'), professionalId: martin._id,    serviceId: corteBarba._id,    clientId: facu._id,    status: 'confirmed' },
    { ...relDate(7, '10:00'), professionalId: diego._id,     serviceId: fade._id,           clientId: facu._id,    status: 'pending' },
    { ...relDate(7, '09:00'), professionalId: lucia._id,     serviceId: tratamiento._id,    clientId: nico._id,    status: 'pending' },
    { ...relDate(7, '08:00'), professionalId: carlos._id,    serviceId: afeitado._id,       clientId: juan._id,    status: 'pending' },
    { ...relDate(7, '10:00'), professionalId: valentina._id, serviceId: corteClasico._id,   clientId: matias._id,  status: 'confirmed' },
    { ...relDate(7, '11:00'), professionalId: valentina._id, serviceId: cejas._id,
      clientName: 'Andrea Leiva', clientEmail: 'andrea@gmail.com', status: 'pending' },

    // ══ En 2 semanas ═════════════════════════════════════════════════════════
    { ...relDate(14, '09:00'), professionalId: martin._id,    serviceId: fade._id,          clientId: pedro._id,   status: 'pending' },
    { ...relDate(14, '09:30'), professionalId: diego._id,     serviceId: corteClasico._id,  clientId: lucas._id,   status: 'confirmed' },
    { ...relDate(14, '10:00'), professionalId: lucia._id,     serviceId: cejas._id,          clientId: agus._id,    status: 'pending' },
    { ...relDate(14, '08:00'), professionalId: carlos._id,    serviceId: barba._id,          clientId: seba._id,    status: 'pending' },
    { ...relDate(14, '10:00'), professionalId: valentina._id, serviceId: corteClasico._id,  clientId: nico._id,    status: 'pending' },

    // ══ En 1 mes ═════════════════════════════════════════════════════════════
    { ...relDate(30, '09:00'), professionalId: martin._id,    serviceId: corteBarba._id,    clientId: juan._id,    status: 'pending' },
    { ...relDate(30, '10:00'), professionalId: lucia._id,     serviceId: tratamiento._id,   clientId: facu._id,    status: 'confirmed' },
    { ...relDate(30, '08:30'), professionalId: carlos._id,    serviceId: afeitado._id,
      clientName: 'Oscar Medina', clientEmail: 'oscar@gmail.com', clientPhone: '+54 11 5555-6677', status: 'pending' },
  ];

  let created = 0;
  for (const apt of appointments) {
    try {
      await Appointment.create(apt);
      created++;
    } catch {
      // colisión de slot único; ignorar
    }
  }
  console.log(`${created} turnos creados`);

  console.log('\n✅ Seed completado para "Barbería El Filo"');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Admin      admin@elfilo.com         / admin123');
  console.log('  Clientes   juan@demo.com, pedro@demo.com, seba@demo.com');
  console.log('             lucas@demo.com, agus@demo.com, matias@demo.com');
  console.log('             facu@demo.com, nico@demo.com  /  cliente123');
  console.log('───────────────────────────────────────────────────────');
  console.log('  Profesionales activos:  Martín, Diego, Lucía, Carlos, Valentina');
  console.log('  Profesional inactivo:   Roberto Pereyra');
  console.log('  Servicios activos:      8   |  Inactivos: 2');
  console.log('═══════════════════════════════════════════════════════\n');

  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
