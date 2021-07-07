import * as readline from "readline";
import { createStore } from 'redux';
import handleCommand from "./commandHandler.js";
import simulationState from "./simulationReducer.js";

const reader = readline.createInterface({ input: process.stdin, output: process.stdout });

const simulation = createStore(simulationState);

reader.on('line', (command: string): void => {
  handleCommand(command, simulation);
});

console.log("Please Enter a Command:");
