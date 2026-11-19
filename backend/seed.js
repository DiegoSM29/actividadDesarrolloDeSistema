/**
 * Script para generar contraseñas hasheadas para los usuarios de ejemplo
 * Ejecutar: node seed.js
 */
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  const usersPath = path.join(__dirname, 'data', 'users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

  // Password por defecto para todos los usuarios de prueba: "123456"
  const defaultPassword = '123456';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(defaultPassword, salt);

  const updatedUsers = users.map((user) => ({
    ...user,
    password: hashedPassword
  }));

  fs.writeFileSync(usersPath, JSON.stringify(updatedUsers, null, 2));
  console.log('✅ Contraseñas de usuarios actualizadas (password: 123456)');
  console.log('Usuarios disponibles:');
  updatedUsers.forEach((u) => console.log(`  📧 ${u.email} / 🔑 123456`));
}

seed().catch(console.error);
