import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
    const unknownCompany = await prisma.industry.upsert({
        where: {
            slug: "unknown",
        },
        update: {
            name: "UNKNOWN",
            slug: "unknown",
        },
        create: {
            name: "UNKNOWN",
            slug: "unknown",
        },
    });

    console.log({
        unknownCompany,
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
