import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createAdmin() {
  const { db } = await import('./src/db');
  const { users } = await import('./src/db/schema');
  const bcrypt = await import('bcryptjs');

  const hash = await bcrypt.default.hash('admin123', 10);
  await db.insert(users).values({
    name: 'Admin JLanguage',
    email: 'admin@jlanguage.uz',
    passwordHash: hash,
    role: 'admin',
    currentJlptLevel: 'N1'
  }).onConflictDoNothing();
  console.log('Admin created: admin@jlanguage.uz / admin123');
  process.exit(0);
}
createAdmin();
