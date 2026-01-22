import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import bcryptjs from 'bcryptjs';
import { coupleProfiles } from '../shared/schema';

async function createDemoCoupleForDaniel() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client);

  // Generate temporary password
  const tempPassword = 'WedflowDemo2026!';
  const hashedPassword = bcryptjs.hashSync(tempPassword, 10);

  try {
    const [couple] = await db.insert(coupleProfiles).values({
      email: 'danielqazi89@gmail.com',
      displayName: 'Demo Brudepar - Daniel',
      password: hashedPassword
    }).onConflictDoNothing().returning();

    if (couple) {
      console.log('✅ Demo couple created successfully!');
      console.log('');
      console.log('📧 Email: danielqazi89@gmail.com');
      console.log('🔑 Temporary Password: ' + tempPassword);
      console.log('');
      console.log('⚠️  Please change this password after first login');
    } else {
      console.log('ℹ️  Couple with this email already exists');
    }
  } catch (error) {
    console.error('❌ Error creating couple:', error);
  }

  await client.end();
}

createDemoCoupleForDaniel().catch(console.error);
