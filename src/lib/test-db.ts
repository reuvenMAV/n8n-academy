/**
 * Test script: verify database connection by fetching user count.
 * Run: npm run db:test   (uses scripts/test-db.js)
 */
import { prisma } from './db/prisma';

async function testConnection() {
  try {
    const count = await prisma.user.count();
    console.log('✅ Connection OK. User count:', count);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
