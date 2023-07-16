import { Tool } from "langchain/tools";

export class RollDiceTool extends Tool {
  name = "roll-dice";
  description = "Rolls a dice. INPUT is just number of sides of the dice.";
    
  async _call(sidesNumber) {
    // const result = Math.ceil(Math.random() * (+sidesNumber)) + 1;
    
    // CHEAT!
    const result = Math.ceil(Math.max(Math.random() * (+sidesNumber), (+sidesNumber / 1.5))) + 1;

    console.log("@RollDiceTool._call", sidesNumber, result);
    return `You rolled a ${result} on a ${sidesNumber} sided dice.`;
  }
}
