/* eslint-disable no-console */
import { PrismaClient } from "@/generated/prisma";
import Prompter from "@/scripts/prompter";
import scrapeGoogle from "@/scripts/puppeteer";

interface IndustryInferredType {
    name?: string;
    industryName?: string;
    slug?: string;
}

export default async function guessIndustry(): Promise<void> {
    const prisma = new PrismaClient();
    let allIndustryString = await determineAllIndustryString(prisma);

    console.log("Fetching all companies");
    const allSponsor = await prisma.company.findMany({
        take: 1000,
        where: {
            industries: {
                none: {},
            },
        },
    });

    for (const sponsor of allSponsor) {
        console.log("Searching google for", sponsor.tradeName);
        const scrapedInfo = await scrapeGoogle(`What is the industry that ${sponsor.tradeName} operates in?`);

        console.log("Trying to guess industry");
        const industry = await determineIndustryFromScrapedInfo(sponsor.tradeName, allIndustryString, scrapedInfo);

        console.log("Guessed: ", industry);

        if (typeof industry.industryName === "undefined" || typeof industry.slug === "undefined") {
            console.warn("Malformed response.");
            continue;
        }

        console.log("Updating company: ", sponsor.id);
        await prisma.company.update({
            where: {
                id: sponsor.id,
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

        // Re-fetch industries so it can be used by the LLM.
        allIndustryString = await determineAllIndustryString(prisma);
    }
}

async function determineAllIndustryString(prisma: PrismaClient): Promise<string> {
    const allIndustry = await prisma.industry.findMany();

    return allIndustry.map((industry) => industry.name).join("\n");
}

async function determineIndustryFromScrapedInfo(companyName: string, allIndustryString: string, scrapedInfo: string): Promise<IndustryInferredType> {
    const prompter = new Prompter({
        instruction: "You are a company researcher, help me do research on companies and determine their industry",
    });

    const prompt = `
According to this google search page, what industry is the company searched: ${allIndustryString}

Output only the industry in plain text in this format {"name": "Company Name", "industryName": "Industry Name", "slug": "industry-name"}.
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
