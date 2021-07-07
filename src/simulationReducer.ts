
import { NORTH, EAST, SOUTH, WEST, DEGREES_IN_CIRCLE } from "./constants/cardinalDirections.js";
import { DEGREES_OF_ROTATION, INITIAL_STATE, UNIT_OF_MOVEMENT } from "./constants/simulationSettings.js";
import { Robot } from "./interfaces/Robot.js";
import { TableTop } from "./interfaces/Tabletop.js";
import { Position } from "./types/position.js";
import { commands, SimulationAction } from "./simulationActions.js";

export type SimulationState = {
  table: TableTop;
  robot: Robot;
};

export function rotateRight(state: SimulationState): SimulationState {
  if (state.robot.placed) {
    let bearing = state.robot.bearing;
    bearing += DEGREES_OF_ROTATION;
    if (bearing >= DEGREES_IN_CIRCLE) {
      bearing -= DEGREES_IN_CIRCLE;
    }
    return { ...state, robot: {...state.robot, bearing: bearing} };
  }
  return state;
}

export function rotateLeft(state: SimulationState): SimulationState{
  if (state.robot.placed) {
    let bearing = state.robot.bearing;
    bearing -= DEGREES_OF_ROTATION;
    if (bearing < 0) {
      bearing += DEGREES_IN_CIRCLE;
    }
    return { ...state, robot: {...state.robot, bearing: bearing} };
  }
  return state;
}

 function verifyTargetPosition(position: Position, height: number, width: number): boolean {
  const conditionsArray = [
    position.x >= 0,
    position.y >= 0,
    position.x < width,
    position.y < height,
  ];
  return !conditionsArray.includes(false);
}

function moveTargetPosition(position: Position, bearing: number): Position {
  switch (bearing) {
    case NORTH:
      return { ...position, y: position.y + UNIT_OF_MOVEMENT } as Position;
    case EAST:
      return { ...position, x: position.x + UNIT_OF_MOVEMENT } as Position;
    case SOUTH:
      return { ...position, y: position.y - UNIT_OF_MOVEMENT } as Position;
    case WEST:
      return { ...position, x: position.x - UNIT_OF_MOVEMENT } as Position;
    default:
      return position;
  }
}

export function move(state: SimulationState): SimulationState {
  if (state.robot.placed) {
    const newPosition = moveTargetPosition(state.robot.position, state.robot.bearing);
    if (verifyTargetPosition(newPosition, state.table.height, state.table.width)) {
      return { ...state, robot: { ...state.robot, position: newPosition } } as SimulationState;
    }
  }
  return state;
}

export function place(state: SimulationState, position: Position, bearing: number): SimulationState {
  if (!state.robot.placed) {
    const conditionsArray = [
      position.x >= 0,
      position.y >= 0,
      position.x < state.table.width,
      position.y < state.table.height,
      bearing >= 0,
      bearing < DEGREES_IN_CIRCLE
    ];

    if (!conditionsArray.includes(false)) {
      return {
        ...state, robot: {
          placed: true,
          position: position,
          bearing: bearing
        }
      };
    }
  }
  return state;
}

export default function simulationState(state: SimulationState = INITIAL_STATE, action: SimulationAction): SimulationState {
  switch (action.type) {
    case commands.ROTATE_RIGHT:
      return rotateRight(state);
    case commands.ROTATE_LEFT:
      return rotateLeft(state);
    case commands.MOVE:
      return move(state);
    case commands.PLACE:
      return place(state, action.position ?? { x: -1, y: -1 } as Position, action.bearing ?? -1);
    default:
      return state;
  }
}
