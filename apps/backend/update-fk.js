const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Conversation" 
      DROP CONSTRAINT "Conversation_adminId_fkey", 
      ADD CONSTRAINT "Conversation_adminId_fkey" 
      FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `);
    console.log("Foreign key constraint updated successfully.");
  } catch (err) {
    console.error("Error updating constraint:", err);
  }
}

main().finally(() => prisma.$disconnect());
