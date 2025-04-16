/* eslint-disable no-console */
import { PrismaClient } from "@/generated/prisma";
import Prompter from "@/scripts/prompter";

export default async function foldIndustries(): Promise<void> {
    const prisma = new PrismaClient();
    const prompter = new Prompter({
        instruction: "Act like an algorithm that classifies and sorts industries.",
        model: "gemma3:4b",
        isLocal: true,
    });
    const allIndustry = await prisma.industry.findMany();

    const prompt = `
\`\`\`industries.csv
${allIndustry.map((industry) => industry.slug).join("\n")}
\`\`\`

Take \`industries.csv\`, and combine the ones that are relatively similar into the most sensible industry.

For example, the following list:
\`\`\`
it-services-and-it-consulting
information-technology
it
software-engineering
\`\`\`
Should result in the answer:
\`\`\`
{
  "industry": "information-technology",
  "similar": [
    "it-services-and-it-consulting"
    "it"
    "software-engineering"
  ]
}
\`\`\`
Reply with only the list of final industries in the format of a json array. Do not use markdown.  
`;

    // throw prompt;
    const answer = await prompter.promptOllama(prompt);

    console.log(answer.choices[0].message.content);
}
