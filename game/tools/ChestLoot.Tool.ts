import { LLMChain, OpenAI, PromptTemplate } from "langchain";
import { Tool } from "langchain/tools";

export class ChestLootTool extends Tool {
  name = "chest-loot";
  description = "Generates loot for a chest once it is opened.";
  async _call() {
    const model = new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });
    const prompt = PromptTemplate.fromTemplate(
      "Randomly generate one of the loots inside the chest, available loots: {loots}?"
    );
    const chain = new LLMChain({ llm: model, prompt });
    const result = await chain.call({
      loots: ["sword", "gold", "healing potion", "empower potion"],
    });
    console.log("@ChestLootTool._call", result.text)

    return `${result.text}!`;
  }
}
