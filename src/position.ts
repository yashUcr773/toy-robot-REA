import {Orientation} from "./orientation";

export interface Coordinate {
  x: number
  y: number
}

export interface Position extends Coordinate {
  orientation: Orientation
}
