/**
 * Script para crear el primer admin
 * Uso: npx ts-node src/scripts/seedAdmin.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-reservas');
  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Ya existe un admin:', existing.email);
    process.exit(0);
  }
  const admin = await User.create({
    name: 'Administrador',
    email: 'admin@reservaya.com',
    password: 'admin123',
    role: 'admin',
  });
  console.log('Admin creado:', admin.email, '/ contraseña: admin123');
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
