import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { IRequester } from "../chat-engine";

export const userRequester: IRequester = {
    async init() {
        this.rl = readline.createInterface({ input, output });
        this.rl.pause();
        return this;
    },

    async request() {
        const input = await this.rl.question("> ");
        this.rl.pause();
        return input;
    }
};