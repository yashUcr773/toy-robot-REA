import * as fs from 'fs';
import * as readline from "readline";
import { createStore, Store } from 'redux';
import handleCommand from '../commandHandler';
import { SimulationAction } from '../simulationActions';
import simulationState, { SimulationState } from '../simulationReducer';

describe("End to end testing stdout using samples", () => {
  let simulation: Store<SimulationState, SimulationAction>;

  let out = "";
  const mockLog = (input: string) => (out += input + "\n");
  const originalLog = console.log;

  beforeEach(() => simulation = createStore(simulationState));
  afterEach(() => console.log = originalLog);

  test("Test sample A", done => {
    out = "";
    const file = fs.createReadStream("./src/testSamples/testSampleA");
    const reader = readline.createInterface({ input: file });
    console.log = jest.fn(mockLog);
    reader.on("line", (command: string): void => {
      handleCommand(command, simulation);
    });

    reader.on("close", () => {
      expect(out).toBe("0,1,NORTH\n");
      done();
    });
  });

  test("Test sample B", done => {
    out = "";
    const file = fs.createReadStream("./src/testSamples/testSampleB");
    const reader = readline.createInterface({ input: file });
    console.log = jest.fn(mockLog);
    reader.on("line", (command: string): void => {
      handleCommand(command, simulation);
    });

    reader.on("close", () => {
      expect(out).toBe("0,0,WEST\n");
      done();
    });
  });

  test("Test sample C", done => {
    out = "";
    const file = fs.createReadStream("./src/testSamples/testSampleC");
    const reader = readline.createInterface({ input: file });
    console.log = jest.fn(mockLog);
    reader.on("line", (command: string): void => {
      handleCommand(command, simulation);
    });

    reader.on("close", () => {
      expect(out).toBe("3,3,NORTH\n");
      done();
    });
  });

  test("Test sample D", done => {
    out = "";
    const file = fs.createReadStream("./src/testSamples/testSampleD");
    const reader = readline.createInterface({ input: file });
    console.log = jest.fn(mockLog);
    reader.on("line", (command: string): void => {
      handleCommand(command, simulation);
    });

    reader.on("close", () => {
      expect(out).toBe("Invalid Command\nInvalid Command\n1,2,EAST\n2,2,EAST\n");
      done();
    });
  });
});
