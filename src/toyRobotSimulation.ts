import { Coordinates, Position } from "./position";
import { forwardMovement, left, right } from "./orientation";

/** Default table dimensions (5x5 units), per the kata specification. */
const DEFAULT_TABLE_SIZE = 5;

/**
 * Computes the position one unit in front of the given position, without
 * checking whether that position is on the table.
 *
 * Flow:
 * 1. Ask `forwardMovement` for the unit vector matching the orientation.
 * 2. Add that offset to the current x/y coordinates.
 * 3. Return a new Position (orientation unchanged); the input is not mutated.
 *
 * @param position the position to move forward from
 * @returns a new position one unit ahead, facing the same direction
 */
const inFrontOf = (position: Position): Position => {
  const { x, y } = forwardMovement(position.orientation)
  return {
    orientation: position.orientation,
    x: position.x + x,
    y: position.y + y
  }
}


/**
 * The core simulation: a rectangular tabletop and (at most) one robot.
 *
 * Invariants:
 * - The robot is either off the table (`undefined`) or at a valid position
 *   within the table bounds; no operation can move it off the edge.
 * - Commands issued before a valid PLACE are silently ignored (each method
 *   guards on `this.robot` being set).
 */
export class ToyRobotSimulation {

  private readonly tableSizeX: number
  private readonly tableSizeY: number
  private readonly obstacles: Coordinates[]
  /** The robot's current position, or `undefined` until it has been placed. */
  private robot: Position | undefined

  /**
   * Creates a simulation with the given table dimensions.
   *
   * Flow:
   * 1. Use the provided width/height if given.
   * 2. Fall back to the 5x5 default for any missing dimension.
   * The robot starts off the table (`undefined`).
   *
   * @param tableSizeX table width in units (default 5)
   * @param tableSizeY table depth in units (default 5)
   */
  constructor(tableSizeX?: number, tableSizeY?: number) {
    this.tableSizeX = tableSizeX ?? DEFAULT_TABLE_SIZE
    this.tableSizeY = tableSizeY ?? DEFAULT_TABLE_SIZE
    this.obstacles = []
  }

  /**
   * Places (or re-places) the robot at the given position.
   *
   * Flow:
   * 1. Validate the requested position against the table bounds.
   * 2. If valid, set it as the robot's position — this works both for the
   *    initial placement and for re-placing an already-placed robot.
   * 3. If invalid (off the table), ignore the command; the robot keeps its
   *    previous state (possibly still unplaced).
   *
   * @param position the coordinates and facing to place the robot at
   */
  placeRobot(position: Position): void {
    if (this.isPositionValid(position)) {
      this.robot = position
    }
    
  }

  /**
   * Moves the robot one unit forward in the direction it is facing.
   *
   * Flow:
   * 1. If the robot has not been placed yet, do nothing.
   * 2. Compute the position one unit ahead via `inFrontOf`.
   * 3. If that position is still on the table, commit it.
   * 4. Otherwise ignore the move — this is what prevents the robot from
   *    falling off the edge.
   */
  moveRobot(): void {
    if (this.robot) {
      const newPosition = inFrontOf(this.robot)
      if (this.isPositionValid(newPosition)) {
        this.robot = newPosition;
      }
    }
  }

  /**
   * Rotates the robot 90 degrees counter-clockwise in place.
   *
   * Flow:
   * 1. If the robot has not been placed yet, do nothing.
   * 2. Replace the robot state with a copy whose orientation is turned
   *    left; x/y are unchanged.
   */
  turnRobotLeft(): void {
    if (this.robot) {
      this.robot = {
        ...this.robot,
        orientation: left(this.robot.orientation)
      }
    }
  }

  /**
   * Rotates the robot 90 degrees clockwise in place.
   *
   * Flow:
   * 1. If the robot has not been placed yet, do nothing.
   * 2. Replace the robot state with a copy whose orientation is turned
   *    right; x/y are unchanged.
   */
  turnRobotRight(): void {
    if (this.robot) {
      this.robot = {
        ...this.robot,
        orientation: right(this.robot.orientation)
      }
    }
  }

  placeObject(): void {
    if (this.robot) {
      const newPosition = inFrontOf(this.robot)
      if (this.isPositionValid(newPosition)) {
        this.obstacles.push({ x: newPosition.x, y: newPosition.y })
      }
    }
  }

  /**
   * Returns the robot's current position, or `undefined` if it has not
   * been placed on the table yet. Used by the command adaptor for REPORT.
   */
  getRobot(): Position | undefined {
    return this.robot;
  }

  /**
   * Checks whether a position lies within the table bounds.
   *
   * Flow:
   * 1. x must be in [0, tableSizeX) — 0-indexed, so a 5-wide table allows 0..4.
   * 2. y must be in [0, tableSizeY).
   * The orientation is not relevant to validity.
   *
   * @param position the position to check
   * @returns true if the position is on the table
   */
  isPositionValid(position: Position): boolean {
    return this.isInBounds(position) && !this.isObstacle(position)
  }

  isInBounds(position: Position) {
    return position.x >= 0 &&
      position.x < this.tableSizeX &&
      position.y >= 0 &&
      position.y < this.tableSizeY;
  }

  isObstacle(position: Position) {
    const val = this.obstacles.findIndex((obstacle) => {
      return obstacle.x === position.x && obstacle.y === position.y
    });
    return val>=0
  }

}
