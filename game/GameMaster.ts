import { ChatOpenAI } from "langchain/chat_models/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  AgentExecutor,
  initializeAgentExecutorWithOptions,
} from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import { RollDiceTool } from "./tools/RollDice.Tool";
import { ChainTool, DynamicTool, Tool } from "langchain/tools";
import { VectorDBQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChestLootTool } from "./tools/ChestLoot.Tool";

let currentArea = "tavern in the village";

export class GameMaster {
  memory: BufferMemory = new BufferMemory();
  model: ChatOpenAI;
  tools: Tool[] = [];
  executor: AgentExecutor;
  ready = false;

  constructor() {
    this.model = new ChatOpenAI({ temperature: 0, modelName: "gpt-4" });
  }

  async prepare() {
    this.tools = [
      new RollDiceTool(),
      new ChestLootTool(),
      new DynamicTool({
        name: "set-current-area",
        description: `Use it when player entering another area. INPUT: short area description"`,
        async func(input) {
          currentArea = input;
          console.log("@set-current-area", currentArea);
          return input;
        }
      }),
      new DynamicTool({
        name: "get-current-area",
        description: "Use it when you need to know player's current area.",
        async func() {
          console.log("@get-current-area", currentArea);
          return currentArea;
        }
      }),
      new ChainTool({
        name: "maps",
        description: `Use it to navigate the player through the game.
        
        connections between areas are described by "->" symbol.

        location map describes the specific location.
        location map consists of areas connected to each other.

        each area consists of a list of instances, separated by ";" symbol.
        some instances are dispatching the situation when player entering the area.
        some instances are just objects that player can interact with.
        area format is the following: <object1>;<object2>;<object3>
        `,
        chain: await this.#createMapChain(),
      }),
    ];

    this.executor = await initializeAgentExecutorWithOptions(
      this.tools,
      this.model,
      {
        agentType: "chat-conversational-react-description",
        agentArgs: {
          systemMessage: PROMPT,
        },
      }
    );
    this.ready = true;
  }

  async action(input: string): Promise<string> {
    const answer = await this.executor.call({ input });
    await this.memory.saveContext({ input }, answer);
    return answer.output;
  }

  async #createMapChain() {
    const loader = new DirectoryLoader("map2", {
      ".txt": (path) => new TextLoader(path),
    });
    const docs = await loader.load();
    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );
    return VectorDBQAChain.fromLLM(this.model, vectorStore);
  }
}

const PROMPT = `
You are a dungeon master in adventure game.
Tell player the story and plot of the game at once.
Tell player his goal to complete the adventure at once. The goal should be simple and clear.
You are talking to the player, player making some actions and you are reacting to them.
Some player actions should be checked by rolling a dice. Roll the dice for the player and tell him the result of rolling and what dice was rolled.
Ask player what he wants to do next.

Create the locations of the game strongly according to the map. No additional locations or areas should be created.
Player starting in tavern in the village.

All riddles should be unique. You can use the same riddle only once.
`;