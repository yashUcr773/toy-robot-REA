import { Position } from "./types/position";

export const commands = {
  ROTATE_RIGHT: 'RIGHT',
  ROTATE_LEFT: 'LEFT',
  MOVE: 'MOVE',
  PLACE: 'PLACE'
};

export type SimulationAction = {
  type: string;
  position?: Position;
  bearing?: number;
};

export function rotateRightAction(): SimulationAction {
  return {
    type: commands.ROTATE_RIGHT
  };
}

export function rotateLeftAction(): SimulationAction {
  return {
    type: commands.ROTATE_LEFT
  };
}
export function moveAction(): SimulationAction {
  return {
    type: commands.MOVE
  };
}

export function placeAction(position: Position, bearing: number): SimulationAction {
  return {
    type: commands.PLACE,
    position: position,
    bearing: bearing
  };
}
