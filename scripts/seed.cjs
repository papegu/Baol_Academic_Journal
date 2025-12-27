/* Seed initial users into the database using Prisma */
const { PrismaClient } = require('../app/generated/prisma');
const crypto = require('crypto');

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw, 'utf8').digest('hex');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = [
      {
        email: 'editeur@senegal-livres.sn',
        password: 'editeur@#$%',
        name: 'Editeur',
        role: 'ADMIN', // requested as one of the two administrators
      },
      {
        email: 'admin@senegal-livres.sn',
        password: 'admin@#$%',
        name: 'Admin',
        role: 'ADMIN',
      },
      {
        email: 'auteur@senegal-livres.sn',
        password: 'auteur@#$%',
        name: 'Auteur',
        role: 'AUTHOR',
      },
    ];

    for (const u of users) {
      const upserted = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          role: u.role,
          password: hashPassword(u.password),
        },
        create: {
          email: u.email,
          name: u.name,
          role: u.role,
          password: hashPassword(u.password),
        },
      });
      console.log(`Upserted user: ${upserted.email} (role: ${upserted.role})`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
