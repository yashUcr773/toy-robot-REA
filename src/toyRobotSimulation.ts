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

const behind = (position: Position): Position => {
  const { x, y } = forwardMovement(position.orientation)
  return {
    orientation: position.orientation,
    x: position.x - x,
    y: position.y - y
  }
}

const copyPosition = (position: Position | undefined): Position | undefined =>
  position ? { ...position } : undefined


export class ToyRobotSimulation {

  private readonly tableSizeX: number
  private readonly tableSizeY: number
  private robot: Position | undefined
  private readonly robotHistory: Array<Position | undefined> = []

  constructor(tableSizeX?: number, tableSizeY?: number) {
    this.tableSizeX = tableSizeX ?? DEFAULT_TABLE_SIZE
    this.tableSizeY = tableSizeY ?? DEFAULT_TABLE_SIZE
  }

  placeRobot(position: Position): void {
    if(this.isPositionValid(position)) {
      this.saveRobotForUndo()
      this.robot = copyPosition(position)
    }
  }

  moveRobot(): void {
    if (this.robot) {
      const newPosition = inFrontOf(this.robot)
      if (this.isPositionValid(newPosition)) {
        this.saveRobotForUndo()
        this.robot = newPosition;
      }
    }
  }

  backRobot(): void {
    if (this.robot) {
      const newPosition = behind(this.robot)
      if (this.isPositionValid(newPosition)) {
        this.saveRobotForUndo()
        this.robot = newPosition;
      }
    }
  }

  turnRobotLeft(): void {
    if(this.robot) {
      this.saveRobotForUndo()
      this.robot = {
        ...this.robot,
        orientation: left(this.robot.orientation)
      }
    }
  }

  turnRobotRight(): void {
    if(this.robot) {
      this.saveRobotForUndo()
      this.robot = {
        ...this.robot,
        orientation: right(this.robot.orientation)
      }
    }
  }

  undoRobot(): void {
    if (this.robotHistory.length > 0) {
      this.robot = copyPosition(this.robotHistory.pop())
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

  private saveRobotForUndo(): void {
    this.robotHistory.push(copyPosition(this.robot))
  }

}
