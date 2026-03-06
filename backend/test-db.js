const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const team = await prisma.teamMember.findMany();
        console.log("SUCCESS:", team);
    } catch (error) {
        console.error("ERROR:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
