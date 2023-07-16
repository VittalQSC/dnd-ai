import { IRequester } from "../chat-engine";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain, OpenAI, PromptTemplate } from "langchain";

async function createMemory() {
  const memory = new ConversationSummaryMemory({
    llm: new OpenAI({ temperature: 0.9, modelName: "gpt-3.5-turbo" }),
    memoryKey: "chat_history",
    returnMessages: true,
  });
  return memory;
}

export const aiRequester: IRequester = {
  async init() {
    this.memory = await createMemory();
    this.model = new OpenAI({ temperature: 0, modelName: "gpt-4" });
    this.chain = new LLMChain({
      llm: this.model,
      prompt: PromptTemplate.fromTemplate(`
The following is a D&D game between a human and an AI, where human is a game master.

Current conversation:
{chat_history}
Human: {input}
AI:`),
      memory: this.memory,
    });
  },

  async request(question: string) {
    question =
      question || "Let's start. Give me the theme of the quest, please!";
    // console.log("@aiRequester.request question", { question });
    const result = await this.chain.call({ input: question });
    console.log("\n\n@aiRequester.request", result.text, "\n\n");
    return result.text;
  },
};
