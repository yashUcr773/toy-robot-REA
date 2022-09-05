import {Position} from "./position";
import {forwardMovement, left, right} from "./orientation";

const DEFAULT_TABLE_SIZE = 5;

const inFrontOf = (position: Position): Position => {
  const { x, y } = forwardMovement(position.orientation)
  return {
    orientation: position.orientation,
    x: position.x + x,
    y: position.y + y
  }
}


export class ToyRobotSimulation {

  private readonly tableSizeX: number
  private readonly tableSizeY: number
  private robot: Position | undefined

  constructor(tableSizeX?: number, tableSizeY?: number) {
    this.tableSizeX = tableSizeX ?? DEFAULT_TABLE_SIZE
    this.tableSizeY = tableSizeY ?? DEFAULT_TABLE_SIZE
  }

  placeRobot(position: Position): void {
    if(this.isPositionValid(position)) {
      this.robot = position
    }
  }

  moveRobot(): void {
    if (this.robot) {
      const newPosition = inFrontOf(this.robot)
      if (this.isPositionValid(newPosition)) {
        this.robot = newPosition;
      }
    }
  }

  turnRobotLeft(): void {
    if(this.robot) {
      this.robot = {
        ...this.robot,
        orientation: left(this.robot.orientation)
      }
    }
  }

  turnRobotRight(): void {
    if(this.robot) {
      this.robot = {
        ...this.robot,
        orientation: right(this.robot.orientation)
      }
    }
  }

  getRobot(): Position | undefined {
    return this.robot;
  }

  isPositionValid(position: Position): boolean {
    return position.x >= 0 &&
        position.x < this.tableSizeX &&
        position.y >= 0 &&
        position.y < this.tableSizeY;
  }

}