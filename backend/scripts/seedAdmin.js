/**
 * One-time admin seed script.
 * Run once: node scripts/seedAdmin.js
 * Then delete or keep for reference — do NOT run again or a duplicate error will be thrown.
 */
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/AdminSchema');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Admin.findOne({ email: 'admin@ucab.com' });
    if (existing) {
      console.log('⚠️  Admin already exists. Skipping seed.');
      return;
    }

    const hash = await bcrypt.hash('Admin@123', 10);
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@ucab.com',
      password: hash,
      mobile: '0000000000',
      role: 'admin'
    });

    console.log('✅ Admin account created:');
    console.log('   Email    : admin@ucab.com');
    console.log('   Password : Admin@123');
    console.log('   Login at : /admin/login');
    console.log('\n⚠️  Change this password immediately after first login!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
