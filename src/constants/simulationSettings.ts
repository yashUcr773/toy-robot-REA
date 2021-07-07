import { SimulationState } from "../simulationReducer.js";

export const DEGREES_OF_ROTATION = 90;
export const UNIT_OF_MOVEMENT = 1;
export const TABLE_WIDTH = 5;
export const TABLE_HEIGHT = 5;
export const INITIAL_STATE: SimulationState = {
  table: {
    width: TABLE_WIDTH,
    height: TABLE_HEIGHT
  },
  robot: {  placed: false,
    position: {
      x: -1,
      y: -1
    },
    bearing: -1
  },
};
