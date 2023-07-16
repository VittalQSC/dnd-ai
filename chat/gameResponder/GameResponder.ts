import { GameEngine } from "../../game/GameEngine";

export class GameResponder {
  game: GameEngine;
  promise: Promise<void>;

  get preparation() {
    return this.promise;
  }

  constructor() {
    this.game = new GameEngine();
    this.promise = this.game.startGame();
  }

  async respond(input: string) {
    await this.promise;
    const response = await this.game.action(input);
    return response;
  }
}
