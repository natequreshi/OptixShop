import { initializeDatabase } from '../backend/src/database/connection';
import db from '../backend/src/database/connection';
import app from '../backend/src/index';

let ready: Promise<void> | null = null;

async function bootstrap() {
  await initializeDatabase();
  // Auto-seed if database is fresh (cold start on Vercel)
  try {
    const row = db.prepare('SELECT id FROM users LIMIT 1').get();
    if (!row) {
      const { seedDatabase } = await import('../backend/src/database/seed');
      seedDatabase();
      db.saveSync();
      console.log('✅ Auto-seeded fresh database on Vercel');
    }
  } catch (e) {
    // Table may not exist yet — seed everything
    try {
      const { seedDatabase } = await import('../backend/src/database/seed');
      seedDatabase();
      db.saveSync();
    } catch (seedErr) {
      console.error('Auto-seed failed:', seedErr);
    }
  }
}

export default async function handler(req: any, res: any) {
  if (!ready) ready = bootstrap();
  await ready;
  return app(req, res);
}
