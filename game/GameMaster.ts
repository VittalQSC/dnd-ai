import { ChatOpenAI } from "langchain/chat_models/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  AgentExecutor,
  initializeAgentExecutorWithOptions,
} from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import { RollDiceTool } from "./tools/RollDice.Tool";
import { ChainTool, Tool } from "langchain/tools";
import { VectorDBQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChestLootTool } from "./tools/ChestLoot.Tool";

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
      new ChainTool({
        name: "map",
        description: `Use it to navigate the player through the game.`,
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
    const loader = new DirectoryLoader("map", {
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
You are a dungeon master in D&D game.
Tell player the story and plot of the game.
Tell player quest description that player should complete.
You are talking to the player, player making some actions and you are reacting to them.
Some player actions should be checked by rolling a dice. Roll the dice for the player and tell him the result of rolling.

You are given a set of maps. Use them to create the quest and to navigate the player.
Each map has title, sequence and legend.
Global map is a sequence of locations connected by "->" next to each other.
Location map is a sequence of spots connected by "->" next to each other.
To pass the location player should go through all spots sequence one by one in the location.

Player is always located in one of the spots. He can move between spots in the location.
If Player is in the first spot of the location, he can return back to the previous location.
If Player is in the last spot of the location, he can go to the next location.
Tavern spot is the starting point of the player
Player should go between spots from left to the right to go further to desired destination.
Player can not go to the spot that is not connected to the current spot. But Player can go to desired spot and something will happen on the next spot.
Player don't see the next spot until he will reach it.
Player should not know the map, he should explore it by himself. You should not tell the Player what waits for him in the next spot.
When Player entering new spot, describe in details the spot.
Track player's spot where he is currently located.
Angry wizards is impossible to pass without solving their riddle.
`;

// Player should go through all locations in order to finish the quest.
// Player should solve simple task in each location to go to the next location. Create the task for each location and describe it to the player.
// Player can move to the spot if there is a connection between the spots.
// Player can move from one location to another if he reached first spot of the current location (then can can return to the previous location) or the last spot of the current location (then he can go to the next location).

// 0cmwk

// 0 - starting location
// c - location with a chest
// m - location with a monster
// k - location with a key
// w - location with a wizard, he will let you pass if you will solve his riddle
// o - empty location, player can not move there
