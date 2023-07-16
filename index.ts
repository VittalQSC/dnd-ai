import dotenv from "dotenv";
dotenv.config();
import { ChatEngine } from "./chat/chat-engine";
import { GameResponder } from "./chat/gameResponder/gameResponder";

async function main() {
  const responder = new GameResponder();
  await responder?.preparation;
  const chatEngine = new ChatEngine(responder);
  for await (const response of chatEngine.startChat()) {
    console.log(response);
  }
}

main();
