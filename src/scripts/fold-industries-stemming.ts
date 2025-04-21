/* eslint-disable no-console */
import natural from "natural";
import { PrismaClient } from "@/generated/prisma";
import * as fs from "node:fs";
import path from "node:path";

interface IndustryGroup {
    industry: string;
    similar: string[];
}

async function readIndustries(): Promise<string[]> {
    const prisma = new PrismaClient();
    const allIndustry = await prisma.industry.findMany({
        where: {
            companies: {
                some: {},
            },
        },
    });

    return allIndustry.map((industry) => industry.slug);
}

function normalizeIndustry(industry: string): string[] {
    // Remove common suffixes and prefixes
    const cleaned = industry
        .replace(/-and-/g, " ")
        .replace(/-/g, " ")
        .replace(/services$/i, "")
        .replace(/industry$/i, "")
        .replace(/manufacturing$/i, "")
        .trim();

    // Tokenize and stem words
    const tokenizer = new natural.WordTokenizer();
    const stemmer = natural.PorterStemmer;

    return tokenizer.tokenize(cleaned)?.map((word) =>
        stemmer.stem(word.toLowerCase())) || [];
}

function calculateSimilarity(a: string, b: string): number {
    const wordsA = normalizeIndustry(a);
    const wordsB = normalizeIndustry(b);

    // Calculate Jaccard similarity on stemmed words
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);

    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    // Base similarity score
    const similarity = intersection.size / union.size;

    // Boost score for exact word matches
    const exactMatches = wordsA.filter((word) => wordsB.includes(word)).length;
    const boostFactor = exactMatches > 0 ? 0.2 : 0;

    return Math.min(1, similarity + boostFactor);
}

function clusterIndustries(industries: string[], threshold = 0.35): IndustryGroup[] {
    const clusters: IndustryGroup[] = [];
    const processed = new Set<string>();

    // Sort industries by length to prioritize shorter, more general terms as cluster centers
    const sortedIndustries = [...industries].sort((a, b) => a.length - b.length);

    for (const industry of sortedIndustries) {
        if (processed.has(industry)) continue;

        const group: IndustryGroup = {
            industry,
            similar: [],
        };

        // Find similar industries
        for (const other of industries) {
            if (other === industry || processed.has(other)) continue;

            const similarity = calculateSimilarity(industry, other);

            if (similarity >= threshold) {
                group.similar.push(other);
                processed.add(other);
            }
        }

        clusters.push(group);
        processed.add(industry);
    }

    // Sort similar industries within each group
    clusters.forEach((group) => {
        group.similar.sort();
    });

    return clusters;
}

export default async function main(): Promise<void> {
    const industries = await readIndustries();
    const grouped = clusterIndustries(industries);

    const currentPath = path.resolve(__dirname);

    fs.writeFileSync(
        `${currentPath}/folded-industry-stemming.json`,
        JSON.stringify(grouped, null, "\t"),
    );

    console.log(grouped);
}
