import { GameMaster } from "./GameMaster";


export class GameEngine {
  gm: GameMaster;

  constructor() {
    this.gm = new GameMaster();
  }

  async startGame() {
    console.log("Game master is preparing...");
    await this.gm.prepare();
    console.log("Game master is ready!");
    console.log("Game started");
  }

  async action(input: string) {
    return this.gm.action(input);
  }
}
