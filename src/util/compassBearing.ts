import { NORTH, EAST, SOUTH, WEST } from "../constants/cardinalDirections.js";

export function bearingToDirection(bearing: number): string {
  switch (bearing) {
    case NORTH:
      return "NORTH";
    case EAST:
      return "EAST";
    case SOUTH:
      return "SOUTH";
    case WEST:
      return "WEST";
    default:
      return ""; 
  }
}

export function directionToBearing(direction: string): number {
  switch (direction) {
    case "NORTH":
      return NORTH;
    case "EAST":
      return EAST;
    case "SOUTH":
      return SOUTH;
    case "WEST":
      return WEST;
    default:
      return -1; 
  }
}