import { NORTH, EAST, SOUTH, WEST } from "../constants/cardinalDirections";
import { TABLE_HEIGHT, TABLE_WIDTH, UNIT_OF_MOVEMENT } from "../constants/simulationSettings";
import { Position } from "../types/position";
import { move, place, rotateLeft, rotateRight, SimulationState } from "../simulationReducer";

describe('Simulation Reducer Unit tests', () => {
  describe('Rotating right', () => {
    let rotateTestState: SimulationState = {
      table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT
      },
      robot: {
        placed: true,
        position: {
          x: 0,
          y: 0,  
        },
        bearing: NORTH
      }
    };

    test('it should rotate right 360 degrees', () => {
      expect(rotateRight(rotateTestState)).toEqual({ ...rotateTestState, robot: { ...rotateTestState.robot, bearing: EAST } });
      rotateTestState = rotateRight(rotateTestState);
      expect(rotateRight(rotateTestState)).toEqual({ ...rotateTestState, robot: { ...rotateTestState.robot, bearing: SOUTH } });
      rotateTestState = rotateRight(rotateTestState);
      expect(rotateRight(rotateTestState)).toEqual({ ...rotateTestState, robot: { ...rotateTestState.robot, bearing: WEST } });
      rotateTestState = rotateRight(rotateTestState);
      expect(rotateRight(rotateTestState)).toEqual({ ...rotateTestState, robot: { ...rotateTestState.robot, bearing: NORTH } });
    });

    const unplacedState: SimulationState = { ...rotateTestState, robot: { ...rotateTestState.robot, placed: false } };

    test('the command should be ignored', () => {
      expect(rotateRight(unplacedState)).toEqual(unplacedState);
    });
  });

  describe('Rotating left', () => {
    let rotateTestState: SimulationState = {
      table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT
      },
      robot: {
        placed: true,
        position: {
          x: 0,
          y: 0,  
        },
        bearing: NORTH
      }
    };

    test('rotate left', () => {
      expect(rotateLeft(rotateTestState)).toEqual({ ...rotateTestState, robot: { ...rotateTestState.robot, bearing: WEST } });
      rotateTestState = rotateLeft(rotateTestState);
      expect(rotateLeft(rotateTestState)).toEqual({ ...rotateTestState, robot: { ...rotateTestState.robot, bearing: SOUTH } });
      rotateTestState = rotateLeft(rotateTestState);
      expect(rotateLeft(rotateTestState)).toEqual({ ...rotateTestState, robot: { ...rotateTestState.robot, bearing: EAST } });
      rotateTestState = rotateLeft(rotateTestState);
      expect(rotateLeft(rotateTestState)).toEqual({ ...rotateTestState, robot: { ...rotateTestState.robot, bearing: NORTH } });
    });

    const unplacedState: SimulationState = { ...rotateTestState, robot: { ...rotateTestState.robot, placed: false } };

    test('the command should be ignored', () => {
      expect(rotateLeft(unplacedState)).toEqual(unplacedState);
    });
  });

  describe('Movement', () => {
    const movementTestState: SimulationState = {
      table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT
      },
      robot: {
        placed: true,
        position: {
          x: 2,
          y: 2,
        },
        bearing: NORTH
      }
    };

    test('move when facing North', () => {
      const newPosition: Position = {
        x: movementTestState.robot.position.x,
        y: movementTestState.robot.position.y + UNIT_OF_MOVEMENT
      };
      expect(move(movementTestState)).toEqual({
        ...movementTestState,
        robot: {
          ...movementTestState.robot,
          position: newPosition
        }
      });
    });

    test('move when facing South', () => {
      movementTestState.robot.bearing = SOUTH;
      const newPosition: Position = {
        x: movementTestState.robot.position.x,
        y: movementTestState.robot.position.y - UNIT_OF_MOVEMENT
      };
      expect(move(movementTestState)).toEqual({
        ...movementTestState,
        robot: {
          ...movementTestState.robot,
          position: newPosition
        }
      });
    });

    test('move when facing East', () => {
      movementTestState.robot.bearing = EAST;
      const newPosition: Position = {
        x: movementTestState.robot.position.x + UNIT_OF_MOVEMENT,
        y: movementTestState.robot.position.y
      };
      expect(move(movementTestState)).toEqual({
        ...movementTestState,
        robot: {
          ...movementTestState.robot,
          position: newPosition
        }
      });
    });

    test('move when facing West', () => {
      movementTestState.robot.bearing = WEST;
      const newPosition: Position= {
        x: movementTestState.robot.position.x - UNIT_OF_MOVEMENT,
        y: movementTestState.robot.position.y
      };
      expect(move(movementTestState)).toEqual({
        ...movementTestState,
        robot: {
          ...movementTestState.robot,
          position: newPosition
        }
      });
    });

    const illegalMoveState: SimulationState = {
      table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT
      },
      robot: {
        placed: true,
        position: {
          x: 0,
          y: 0,  
        },
        bearing: SOUTH
      }
    };

    test('ignore command when moving off table', () => {
      expect(move(illegalMoveState)).toEqual(illegalMoveState); //Moving South off table

      illegalMoveState.robot.bearing = WEST;

      expect(move(illegalMoveState)).toEqual(illegalMoveState); //Moving West off table

      illegalMoveState.robot.position.x = 4;
      illegalMoveState.robot.position.y = 4;
      illegalMoveState.robot.bearing = NORTH;

      expect(move(illegalMoveState)).toEqual(illegalMoveState); //Moving North off table

      illegalMoveState.robot.bearing = EAST;

      expect(move(illegalMoveState)).toEqual(illegalMoveState); //Moving East off table

      illegalMoveState.robot.placed = false;

      expect(move(illegalMoveState)).toEqual(illegalMoveState); //Moving when not placed
    });
  });

  describe('Placement', () => {
    const placementTestState: SimulationState = {
      table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT
      },
      robot: {
        placed: false,
        position: {
          x: -1,
          y: -1,  
        },
        bearing: -1
      }
    };

    test('place robot on table', () => {
      let position: Position = {
        x: 1,
        y: 0
      };
      expect(place(placementTestState, position, NORTH)).toEqual({ ...placementTestState, robot: { placed: true, position, bearing: NORTH } });
      position = {
        x: 0,
        y: 1
      };
      expect(place(placementTestState, position, NORTH)).toEqual({ ...placementTestState, robot: { placed: true, position, bearing: NORTH } });
      position = {
        x: 0,
        y: 0
      };
      expect(place(placementTestState, position, EAST)).toEqual({ ...placementTestState, robot: { placed: true, position, bearing: EAST } });
    });

    test('ignore place command if invalid placement parameters', () => {
      let position: Position = {
        x: 5,
        y: 0
      };
      expect(place(placementTestState, position, NORTH)).toEqual(placementTestState);
      position= {
        x: 0,
        y: 5
      };
      expect(place(placementTestState, position, NORTH)).toEqual(placementTestState);
      position = {
        x: 0,
        y: 0
      };
      expect(place(placementTestState, position, -1)).toEqual(placementTestState);
    });
  });
});
