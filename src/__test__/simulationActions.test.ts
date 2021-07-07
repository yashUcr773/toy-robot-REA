import { NORTH } from "../constants/cardinalDirections";
import { Position } from "../types/position";
import { commands, moveAction, placeAction, rotateLeftAction, rotateRightAction, SimulationAction } from "../simulationActions";

describe("Simulation Actions Unit tests", () => {
  test("return the rotate right action", () => {
    const expectedObject: SimulationAction = {
      type: commands.ROTATE_RIGHT
    };
    expect(rotateRightAction()).toEqual(expectedObject);
  });

  test("return the rotate left action", () => {
    const expectedObject: SimulationAction = {
      type: commands.ROTATE_LEFT
    };
    expect(rotateLeftAction()).toEqual(expectedObject);
  });

  test("return the move action", () => {
    const expectedObject: SimulationAction = {
      type: commands.MOVE
    };
    expect(moveAction()).toEqual(expectedObject);
  });

  test("return the place action for 0,0,NORTH", () => {
    const position: Position = {
      x: 0,
      y: 0
    };

    const expectedObject: SimulationAction = {
      type: commands.PLACE,
      position: position,
      bearing: NORTH
    };

    expect(placeAction(position, NORTH)).toEqual(expectedObject);
  });
});
