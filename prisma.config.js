// Load environment variables
require('dotenv/config');

// Simple Prisma configuration object (for custom scripts/tools)
module.exports = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
