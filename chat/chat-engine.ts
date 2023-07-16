// import * as readline from "node:readline/promises";
// import { stdin as input, stdout as output } from "node:process";
import { aiRequester } from "./aiRequester/aiRequester";
import { userRequester } from "./userRequester/userRequester";

export interface IResponser {
  preparation?: Promise<void>;
  respond(input: string): Promise<string>;
}

export interface IRequester {
  init(): Promise<void>;
  preparation?: Promise<void>;
  request(input: string): Promise<string>;
}

export class ChatEngine {
  responser: IResponser;
  requester: IRequester;
  // rl: readline.Interface;

  constructor(responser: IResponser) {
    this.responser = responser;
    this.requester = process.env.PLAYER === "AI" ? aiRequester : userRequester;
    // this.rl = readline.createInterface({ input, output });
  }

  async *startChat() {
    await this.requester.init();
    let input = "";
    let response = "";
    // this.rl.pause();
    while (input !== "exit") {
      input = await this.requester.request(response);
      // input = await this.rl.question("> ");
      // this.rl.pause();
      response = await this.responser.respond(input);
      yield response;
    }
  }
}
