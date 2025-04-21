import Scraper from "@/lib/Scraper";
import { PrismaClient } from "@/generated/prisma";

interface CompanySponsor {
    tradeName: string;
    registrationNumber: string;
}

export default async function updateAllSponsor(): Promise<void> {
    const prisma = new PrismaClient();
    const allSponsor = await fetchAllSponsor();

    /* eslint-disable no-console */
    console.log(`Fetched ${allSponsor.length} sponsors`);

    for (const company of allSponsor) {
        const { tradeName, registrationNumber } = company;

        await prisma.company.upsert({
            where: {
                tradeName,
            },
            update: {
                tradeName,
                registrationNumber,
            },
            create: {
                tradeName,
                registrationNumber,
                industries: {
                    connect: {
                        id: 1,
                    },
                },
            },
        });
    }
}

async function fetchAllSponsor(): Promise<CompanySponsor[]> {
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

    const allCompanyRow = tableElement.querySelectorAll("tr");
    const allCompany: CompanySponsor[] = [];

    allCompanyRow.forEach((company: Element) => {
        const tradeName = company.querySelector("th")?.textContent;
        const registrationNumber = company.querySelector("td")?.textContent;

        if (tradeName && registrationNumber) {
            allCompany.push({
                tradeName,
                registrationNumber,
            });
        }
    });

    return allCompany;
}
