/* eslint-disable no-console */
import type { Company } from "@/generated/prisma";
import { PrismaClient } from "@/generated/prisma";
import Prompter from "@/scripts/prompter";
import {
    scrapeCreditSafe, scrapeGoogle, scrapeKvK,
} from "@/scripts/puppeteer";

interface IndustryInferredType {
    name?: string;
    industryName?: string;
    slug?: string;
    confidence?: number;
}

const scrapers = [
    "creditsafe",
    "kvk",
    "google",
];

type ScraperType = typeof scrapers[number];

export default async function guessIndustry(): Promise<void> {
    let allIndustryString = await determineAllIndustryString();

    console.log("Fetching all companies");
    const allSponsor = await fetchAllSponsor();

    for (const sponsor of allSponsor) {
        let isUpdated = false;

        for (let i = 0; i < scrapers.length && !isUpdated; i++) {
            console.log(`Searching ${scrapers[i]} for`, sponsor.tradeName);
            const scrapedInfo = await scrape(sponsor, scrapers[i]);

            if (scrapedInfo === null) {
                console.log("An error occurred - try next scraper or company.");
                continue;
            }

            console.log("Trying to guess industry");
            const industry = await determineIndustryFromScrapedInfo(sponsor.tradeName, allIndustryString, scrapedInfo);

            console.log("Guessed: ", industry);

            if (typeof industry.industryName === "undefined" || typeof industry.slug === "undefined") {
                console.warn("Malformed response.");
                continue;
            }

            if ((industry?.confidence ?? 0) < 0.8) {
                console.warn("Confidence too low.");
                continue;
            }

            console.log("Updating company: ", sponsor.id);
            updateSponsor(sponsor.id, industry);
            isUpdated = true;
        }

        // Re-fetch industries so it can be used by the LLM.
        allIndustryString = await determineAllIndustryString();
    }
}

async function scrape(sponsor: Company, scraper: ScraperType): Promise<string | null> {
    switch (scraper) {
    case "kvk":
        return scrapeKvK(sponsor.registrationNumber);
    case "creditsafe":
        return await scrapeCreditSafe(sponsor.tradeName);
    case "google":
        return await scrapeGoogle(sponsor.tradeName);
    default:
        return null;
    }
}

async function determineAllIndustryString(): Promise<string> {
    const prisma = new PrismaClient();
    const allIndustry = await prisma.industry.findMany({
        take: 100,
    });

    return allIndustry.map((industry) => industry.name).join("\n");
}

async function determineIndustryFromScrapedInfo(companyName: string, allIndustryString: string, scrapedInfo: string): Promise<IndustryInferredType> {
    const prompter = new Prompter({
        instruction: "You are a company researcher, help me do research on companies and determine their industry",
    });

    const prompt = `
\`\`\` industries.txt
${allIndustryString}
\`\`\`
According to this google search page, what industry is the company searched: ${companyName}

Output only the industry in plain text in this format 
{
    "name": "Company Name", 
    "industryName": "Industry Name", 
    "slug": "industry-name", 
    "confidence": [decimal between 0 and 1 indicating the confidence of the guess],
}.
Do not use markdown.
Use the list of industries to classify the company in question, and if it is not in that list, recommend a new one.

-- Start of google search page --
${scrapedInfo}
-- End of google search page --
`;

    const completion = await prompter.prompt(prompt);
    const outputString = completion.output_text;

    let outputParsed: IndustryInferredType = {
        name: companyName,
        industryName: "Unknown",
        slug: "unknown",
    };

    try {
        outputParsed = JSON.parse(outputString);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Cannot parse: ", outputString, error.message);
        } else {
            console.error("Cannot parse: ", outputString, error);
        }
    }

    return outputParsed;
}

function fetchAllSponsor(): Promise<Company[]> {
    const prisma = new PrismaClient();

    return prisma.company.findMany({
        take: 5000,
        where: {
            industries: {
                none: {},
            },
        },
    });
}

async function updateSponsor(sponsorId: number, industry: IndustryInferredType): Promise<void> {
    const prisma = new PrismaClient();

    await prisma.company.update({
        where: {
            id: sponsorId,
        },
        data: {
            industries: {
                connectOrCreate: [{
                    create: {
                        name: industry.industryName as string,
                        slug: industry.slug as string,
                    },
                    where: {
                        slug: industry.slug,
                    },
                }],
            },
        },
    });
}
