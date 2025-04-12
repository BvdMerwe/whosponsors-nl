import Scraper from "@/lib/Scraper";
import { PrismaClient } from "@/generated/prisma";

export default async function updateAllSponsor(): Promise<void> {
    const prisma = new PrismaClient();
    const industryDefault = await prisma.industry.findFirstOrThrow({
        where: {
            slug: "unknown",
        },
    });

    const allSponsor = await fetchAllSponsor();

    /* eslint-disable no-console */
    console.log(`Fetched ${allSponsor.length} sponsors`);

    for (const company of allSponsor) {
        await prisma.company.upsert({
            where: {
                tradeName: company,
            },
            update: {
                tradeName: company,
            },
            create: {
                tradeName: company,
                industryId: industryDefault.id,
            },
        });
    }
}

async function fetchAllSponsor(): Promise<string[]> {
    const scraper = new Scraper({
        url: new URL(
            "https://ind.nl/en/public-register-recognised-sponsors/public-register-regular-labour-and-highly-skilled-migrants",
        ),
    });

    const document = (await scraper.start())[0];

    const tableElement = document.querySelector(
        "#content div.row.no-gutters.order-3 section table tbody",
    );

    if (tableElement === null) {
        throw "TABLE IS EMPTY";
    }

    const allCompanyElement = tableElement.querySelectorAll("tr th");
    const allCompany: string[] = [];

    allCompanyElement.forEach((company: Element) => allCompany.push(company.textContent ?? ""));

    return allCompany;
}
