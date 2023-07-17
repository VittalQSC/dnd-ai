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

async function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const aiRequester: IRequester = {
  async init() {
    this.memory = await createMemory();
    this.model = new OpenAI({ temperature: 0, modelName: "gpt-4" });
    this.chain = new LLMChain({
      llm: this.model,
      prompt: PromptTemplate.fromTemplate(`
The following is a adventure game between a human and an AI, where human is a game master.
Your goal is to finish the quest and get the reward.
You should win as soon as possible.
You are the warrior, you like to fight and you are not very smart.
Also you like open chests and get loot from them.

Current conversation:
{chat_history}
Human: {input}
AI:`),
      memory: this.memory,
    });
  },

  async request(question: string) {
    question =
      question ||
      "Let's start. Give me the title of the quest in a couple of words, please!";
    // console.log("@aiRequester.request question", { question });
    const result = await this.chain.call({ input: question });
    // await delay(2000);
    console.log("\n\n@aiRequester.request", result.text, "\n\n");
    return result.text;
  },
};
