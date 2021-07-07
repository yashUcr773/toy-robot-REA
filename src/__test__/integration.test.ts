import { createStore } from "redux";
import handleCommand from "../commandHandler";
import { EAST, NORTH, WEST } from "../constants/cardinalDirections";
import { INITIAL_STATE, TABLE_HEIGHT, TABLE_WIDTH } from "../constants/simulationSettings";
import { moveAction, placeAction, rotateLeftAction } from "../simulationActions";
import simulationState, { SimulationState } from "../simulationReducer";
import { Position } from "../types/position";

describe('Testing simulationActions and simulationReducer with examples', () => {
  let testStore = createStore(simulationState);

  afterEach(() => testStore = createStore(simulationState)); // INITIAL STATE
  test('Example A', () => {
    const expectedState = {
      table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT
      },
      robot: {
        placed: true,
        position: {
          x: 0,
          y: 1
        },
        bearing: NORTH
      }
    };
    const initialPosition: Position = {
      x: 0,
      y: 0
    };
    testStore.dispatch(placeAction(initialPosition, NORTH));
    testStore.dispatch(moveAction());
    expect(testStore.getState()).toStrictEqual(expectedState);
  });

  test('Example B', () => {
    const expectedState = {
      table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT
      },
      robot: {
        placed: true,
        position: {
          x: 0,
          y: 0
        },
        bearing: WEST
      }
    };
    const initialPosition: Position = {
      x: 0,
      y: 0
    };
    testStore.dispatch(placeAction(initialPosition, NORTH));
    testStore.dispatch(rotateLeftAction());
    expect(testStore.getState()).toStrictEqual(expectedState);
  });
 
  test('Example C', () => {
    const expectedState = {
      table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT
      },
      robot: {
        placed: true,
        position: {
          x: 3,
          y: 3
        },
        bearing: NORTH
      }
    };
    const initialPosition: Position = {
      x: 1,
      y: 2
    };
    testStore.dispatch(placeAction(initialPosition, EAST));
    testStore.dispatch(moveAction());
    testStore.dispatch(moveAction());
    testStore.dispatch(rotateLeftAction());
    testStore.dispatch(moveAction());
    expect(testStore.getState()).toStrictEqual(expectedState);
  });
});

describe("Command handler and Simulation State integration test", () => {
  let testStore = createStore(simulationState);

  let out = "";
  const mockLog = (input: string) => (out += input);
  const originalLog = console.log;
  afterEach(() => console.log = originalLog);

  test("Valid commands should change the state", () => {
    const expectedState = {
      table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT
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
    out = "";
    console.log = jest.fn(mockLog);

    handleCommand("PLACE 0,0,NORTH", testStore);
    expect(testStore.getState()).toEqual(expectedState);
    expect(out).toBe("");

    expectedState.robot.position.y = 1;
    handleCommand("MOVE", testStore);
    expect(testStore.getState()).toEqual(expectedState);
    expect(out).toBe("");

    expectedState.robot.bearing = EAST;
    handleCommand("RIGHT", testStore);
    expect(testStore.getState()).toEqual(expectedState);
    expect(out).toBe("");

    expectedState.robot.bearing = NORTH;
    handleCommand("LEFT", testStore);
    expect(testStore.getState()).toEqual(expectedState);
    expect(out).toBe("");

    console.log = jest.fn(mockLog);
    handleCommand("REPORT", testStore);
    expect(out).toBe("0,1,NORTH");
  });

  test("Invalid commands should be ignored by simulation", () => {
    testStore = createStore(simulationState); // INITIAL STATE

    out = "";
    console.log = jest.fn(mockLog);

    handleCommand("REPORT", testStore);
    expect(testStore.getState()).toEqual(INITIAL_STATE);
    expect(out).toBe("");

    handleCommand("MOVE", testStore);
    expect(testStore.getState()).toEqual(INITIAL_STATE);
    expect(out).toBe("");

    handleCommand("", testStore);
    expect(testStore.getState()).toEqual(INITIAL_STATE);
    expect(out).toBe("Invalid Command");

    out = "";
    handleCommand("Test 123", testStore);
    expect(testStore.getState()).toEqual(INITIAL_STATE);
    expect(out).toBe("Invalid Command");

    out = "";
    handleCommand("PLACE MOVE", testStore);
    expect(testStore.getState()).toEqual(INITIAL_STATE);
    expect(out).toBe("Invalid Command");

    out = "";
    handleCommand("PLACE X,Y,F", testStore);
    expect(testStore.getState()).toEqual(INITIAL_STATE);
    expect(out).toBe("Invalid Command");
  });

  test("Invalid commands after robot has been placed should be ignored", () => {
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

    out = "";
    console.log = jest.fn(mockLog);

    testStore = createStore(simulationState, preloadedState);

    handleCommand("Test 123", testStore);
    expect(testStore.getState()).toEqual(preloadedState);
    expect(out).toBe("Invalid Command");

    out = "";
    handleCommand("PLACE MOVE", testStore);
    expect(testStore.getState()).toEqual(preloadedState);
    expect(out).toBe("Invalid Command");

    out = "";
    handleCommand("PLACE X,Y,F", testStore);
    expect(testStore.getState()).toEqual(preloadedState);
    expect(out).toBe("Invalid Command");

    out = "";
    handleCommand("MOVE 3", testStore);
    expect(testStore.getState()).toEqual(preloadedState);
    expect(out).toBe("Invalid Command");
  });
});
