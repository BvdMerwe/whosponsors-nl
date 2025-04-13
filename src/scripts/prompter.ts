import OpenAI from "openai";
import type { ResponsesModel } from "openai/resources";

interface PrompterOption {
    model?: ResponsesModel;
    instruction: string;
    shouldUseWebSearch?: boolean;
}

export default class Prompter {
    private client: OpenAI;
    private model: ResponsesModel;
    private instruction: string;

    constructor({
        instruction,
        model = "gpt-4o-mini",
    }: PrompterOption) {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            // baseURL: "http://127.0.0.1:11434/v1",
        });

        this.instruction = instruction;
        this.model = model;
    }

    public setModel(model: ResponsesModel): void {
        this.model = model;
    }

    public setInstruction(instruction: string): void {
        this.instruction = instruction;
    }

    public async prompt(prompt: string): Promise<OpenAI.Responses.Response> {
        return this.client.responses.create({
            model: this.model,
            instructions: this.instruction,
            input: prompt,
        });
    }

    public async promptOllama(prompt: string): Promise<OpenAI.Chat.ChatCompletion> {
        return this.client.chat.completions.create({
            model: "qwen2.5:3b",
            messages: [{
                role: "developer",
                content: this.instruction,
            }, {
                role: "user",
                content: prompt,
            }],

        });
    }

    public async research(prompt: string): Promise<OpenAI.Chat.ChatCompletion> {
        return this.client.chat.completions.create({
            model: "gpt-4o-mini-search-preview",
            messages: [{
                role: "user",
                content: prompt,
            }],
            web_search_options: {
                user_location: {
                    type: "approximate",
                    approximate: {
                        country: "NL",
                        city: "Rotterdam",
                        region: "Rotterdam",
                    },
                },
            },
        });
    }
}
