import { Orientation } from "./orientation";

/**
 * A robot's full state on the table: its grid coordinates plus the
 * direction it is facing.
 *
 * - `x`: horizontal coordinate (0 = west edge, grows towards EAST)
 * - `y`: vertical coordinate (0 = south edge, grows towards NORTH)
 * - `orientation`: the compass direction the robot is facing
 */
export interface Position {
  x: number
  y: number
  orientation: Orientation
}

export interface Coordinates {
  x: number
  y: number
}