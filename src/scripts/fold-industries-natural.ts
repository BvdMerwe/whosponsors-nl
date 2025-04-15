import natural from "natural";
import { PrismaClient } from "@/generated/prisma";

interface IndustryGroup {
    industry: string;
    similar: string[];
}

async function readIndustries(): Promise<string[]> {
    const prisma = new PrismaClient();
    const allIndustry = await prisma.industry.findMany();

    return allIndustry.map((industry) => industry.slug);
}

function jaccardSimilarity(a: string, b: string): number {
    const tokenizer = new natural.WordTokenizer();
    const setA = new Set(tokenizer.tokenize(a));
    const setB = new Set(tokenizer.tokenize(b));

    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
}

function clusterIndustries(industries: string[], threshold = 0.4): IndustryGroup[] {
    const clusters: IndustryGroup[] = [];

    for (const industry of industries) {
        let added = false;

        for (const group of clusters) {
            const similarity = jaccardSimilarity(industry, group.industry);

            if (similarity >= threshold) {
                group.similar.push(industry);
                added = true;
                break;
            }
        }

        if (!added) {
            clusters.push({
                industry, similar: [],
            });
        }
    }

    return clusters;
}

export default async function main(): Promise<void> {
    const industries = await readIndustries();
    const grouped = clusterIndustries(industries, 0.4);

    console.log(grouped);
}
