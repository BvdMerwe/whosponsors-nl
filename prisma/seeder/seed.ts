import { PrismaClient } from "@/generated/prisma/client";
import allIndustry from "./industries.json";

const prisma = new PrismaClient();

async function main(): Promise<void> {
    for (const industry of allIndustry) {
        const { slug, name } = industry;

        const industryRecord = await prisma.industry.upsert({
            where: {
                slug,
            },
            update: {
                name,
                slug,
            },
            create: {
                name,
                slug,
            },
        });

        /* eslint-disable no-console */
        console.log({
            company: industryRecord,
        });
    }
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
