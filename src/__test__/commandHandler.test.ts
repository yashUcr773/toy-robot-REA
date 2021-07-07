import { createStore } from "redux";
import { NORTH } from "../constants/cardinalDirections";
import handleCommand, { Command, parseCommands } from "../commandHandler";
import simulationState, { SimulationState } from "../simulationReducer";

describe("Command Handler unit test", () => {
  describe("Command Parser tests", () => {
    test("PLACE command with valid arguments should return valid command object", () => {
      const expectedCommand: Command = {
        command: "PLACE",
        arguments: ["0", "0", "NORTH"]
      };
      expect(parseCommands("PLACE 0,0,NORTH")).toEqual(expectedCommand);
    });

    test("RIGHT command should return valid command object", () => {
      const expectedCommand: Command = {
        command: "RIGHT",
        arguments: []
      };
      expect(parseCommands("RIGHT")).toEqual(expectedCommand);
    });

    test("LEFT command should return valid command object", () => {
      const expectedCommand: Command = {
        command: "LEFT",
        arguments: []
      };
      expect(parseCommands("LEFT")).toEqual(expectedCommand);
    });

    test("MOVE command should return valid command object", () => {
      const expectedCommand: Command = {
        command: "MOVE",
        arguments: []
      };
      expect(parseCommands("MOVE")).toEqual(expectedCommand);
    });

    test("REPORT command should return valid command object", () => {
      const expectedCommand: Command = {
        command: "REPORT",
        arguments: []
      };
      expect(parseCommands("REPORT")).toEqual(expectedCommand);
    });

    test("Invalid command should return bad input command object", () => {
      const expectedCommand: Command = {
        command: "BAD INPUT",
        arguments: []
      };
      expect(parseCommands("REPORT 1")).toEqual(expectedCommand);
      expect(parseCommands("test 123")).toEqual(expectedCommand);
      expect(parseCommands("RIGHT LEFT MOVE")).toEqual(expectedCommand);
    });
  });

  describe("Command handler tests", () => {
    const preloadedState: SimulationState = {
      table: {
        width: 5,
        height: 5
      },
      robot: {
        placed: true,
        position: {
          x: 0,
          y: 0
        },
        bearing: NORTH
      }
    };
    const simulation = createStore(simulationState, preloadedState);

    const unplacedSimulation = createStore(simulationState);

    let out = "";
    const mockLog = (input: string) => (out += input);
    const originalLog = console.log;

    afterEach(() => console.log = originalLog);

    test("REPORT command outputs with console log", () => {
      out = "";
      console.log = jest.fn(mockLog);
      handleCommand("REPORT", simulation);
      expect(out).toBe("0,0,NORTH");
    });

    test("REPORT when robot is not placed should not output to console log", () => {
      out = "";
      console.log = jest.fn(mockLog);
      handleCommand("REPORT", unplacedSimulation);
      expect(out).toBe("");
    });

    test("Invalid commands should log invalid commands", () => {
      out = "";
      console.log = jest.fn(mockLog);
      
      handleCommand("REPORT 1", unplacedSimulation);
      expect(out).toEqual("Invalid Command");

      out = "";
      handleCommand("test 123", unplacedSimulation);
      expect(out).toEqual("Invalid Command");

      out = "";
      handleCommand("test 123", unplacedSimulation);
      expect(out).toEqual("Invalid Command");
    });
  });
});
