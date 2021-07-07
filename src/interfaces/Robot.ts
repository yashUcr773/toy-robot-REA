import { Position } from "../types/position";

export interface Robot {
  placed: boolean;
  position: Position;
  bearing: number;
}
