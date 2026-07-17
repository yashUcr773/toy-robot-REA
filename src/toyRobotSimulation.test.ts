import {Position} from "./position";
import {Orientation} from "./orientation";
import {ToyRobotSimulation} from "./toyRobotSimulation";

describe("toyRobotSimulation", () => {
  test("position with negative x axis should be invalid", () => {
    const positionValid = fiveByFiveTable().isPositionValid({
      ...originPosition(),
      x: -1,
      y: 0
    })
    expect(positionValid).toEqual(false)
  })

  test("position with negative y axis should be invalid", () => {
    const positionValid = fiveByFiveTable().isPositionValid({
      ...originPosition(),
      x: 0,
      y: -1
    })
    expect(positionValid).toEqual(false)
  })

  test("position with x axis greater than table size should be invalid", () => {
    const positionValid = fiveByFiveTable().isPositionValid({
      ...originPosition(),
      x: 5,
      y: 0
    })
    expect(positionValid).toEqual(false)
  })

  test("far corner position is valid", () => {
    const positionValid = fiveByFiveTable().isPositionValid({
      ...originPosition(),
      x: 4,
      y: 4
    })
    expect(positionValid).toEqual(true)
  })

  test("origin position is valid", () => {
    const positionValid = fiveByFiveTable().isPositionValid(originPosition())
    expect(positionValid).toEqual(true)
  })

  test("middle position is valid", () => {
    const positionValid = fiveByFiveTable().isPositionValid({
      ...originPosition(),
      x: 2,
      y: 2
    })
    expect(positionValid).toEqual(true)
  })

  test("position with obstacle should be invalid", () => {
    const simulation = new ToyRobotSimulation(5, 5, [{ x: 2, y: 2 }]);
    const positionValid = simulation.isPositionValid({
      ...originPosition(),
      x: 2,
      y: 2
    })
    expect(positionValid).toEqual(false)
  })

  test("should add obstacle inside table", () => {
    const simulation = fiveByFiveTable();
    simulation.addObstacle({ x: 2, y: 2 })
    expect(simulation.hasObstacleAt({ x: 2, y: 2 })).toEqual(true)
  })

  test("should ignore obstacle outside table", () => {
    const simulation = fiveByFiveTable();
    simulation.addObstacle({ x: 5, y: 5 })
    expect(simulation.hasObstacleAt({ x: 5, y: 5 })).toEqual(false)
  })

  test("should ignore obstacle on current robot position", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.addObstacle(originPosition())
    expect(simulation.hasObstacleAt(originPosition())).toEqual(false)
  })

  test("placing robot at invalid position should be ignored", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(invalidPosition())
    expect(simulation.getRobot()).toBeUndefined()
  })

  test("placing robot with invalid position should ignore command", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    expect(simulation.getRobot()).toEqual(originPosition())
    simulation.placeRobot(invalidPosition())
    expect(simulation.getRobot()).toEqual(originPosition())
  })

  test("placing robot on obstacle should be ignored", () => {
    const simulation = new ToyRobotSimulation(5, 5, [{ x: 0, y: 0 }]);
    simulation.placeRobot(originPosition())
    expect(simulation.getRobot()).toBeUndefined()
  })

  test("should move one unit north", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.moveRobot()
    expect(simulation.getRobot()).toEqual({
      ...originPosition(),
      x: 0,
      y: 1
    })
  })

  test("should not move north beyond boundary", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot({
      ...originPosition(),
      x: 0,
      y: 4
    });
    simulation.moveRobot()
    expect(simulation.getRobot()).toEqual({
      ...originPosition(),
      x: 0,
      y: 4
    })
  })

  test("should not move into obstacle", () => {
    const simulation = new ToyRobotSimulation(5, 5, [{ x: 0, y: 1 }]);
    simulation.placeRobot(originPosition());
    simulation.moveRobot()
    expect(simulation.getRobot()).toEqual(originPosition())
  })

  test("should move one unit back without changing orientation", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot({
      ...originPosition(),
      x: 0,
      y: 1
    });
    simulation.backRobot()
    expect(simulation.getRobot()).toEqual(originPosition())
  })

  test("should move one unit back from east", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot({
      ...originPosition(),
      x: 2,
      y: 2,
      orientation: Orientation.EAST
    });
    simulation.backRobot()
    expect(simulation.getRobot()).toEqual({
      ...originPosition(),
      x: 1,
      y: 2,
      orientation: Orientation.EAST
    })
  })

  test("should not move back beyond boundary", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.backRobot()
    expect(simulation.getRobot()).toEqual(originPosition())
  })

  test("should not move back into obstacle", () => {
    const simulation = new ToyRobotSimulation(5, 5, [{ x: 0, y: 0 }]);
    simulation.placeRobot({
      ...originPosition(),
      y: 1
    });
    simulation.backRobot()
    expect(simulation.getRobot()).toEqual({
      ...originPosition(),
      y: 1
    })
  })

  test("should turn left", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.turnRobotLeft()
    expect(simulation.getRobot()).toEqual({
      ...originPosition(),
      orientation: Orientation.WEST
    })
  })

  test("should turn right", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.turnRobotRight()
    expect(simulation.getRobot()).toEqual({
      ...originPosition(),
      orientation: Orientation.EAST
    })
  })

  test("should undo last move", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.moveRobot()
    simulation.undoRobot()
    expect(simulation.getRobot()).toEqual(originPosition())
  })

  test("should undo turn left", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.turnRobotLeft()
    simulation.undoRobot()
    expect(simulation.getRobot()).toEqual(originPosition())
  })

  test("should undo first valid place", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.undoRobot()
    expect(simulation.getRobot()).toBeUndefined()
  })

  test("should support multiple undos", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.moveRobot()
    simulation.turnRobotRight()
    simulation.moveRobot()

    simulation.undoRobot()
    expect(simulation.getRobot()).toEqual({
      ...originPosition(),
      x: 0,
      y: 1,
      orientation: Orientation.EAST
    })

    simulation.undoRobot()
    expect(simulation.getRobot()).toEqual({
      ...originPosition(),
      x: 0,
      y: 1
    })

    simulation.undoRobot()
    expect(simulation.getRobot()).toEqual(originPosition())
  })

  test("should not record blocked movements for undo", () => {
    const simulation = fiveByFiveTable();
    simulation.placeRobot(originPosition());
    simulation.backRobot()
    simulation.undoRobot()
    expect(simulation.getRobot()).toBeUndefined()
  })

  test("should not record obstacle blocked movements for undo", () => {
    const simulation = new ToyRobotSimulation(5, 5, [{ x: 0, y: 1 }]);
    simulation.placeRobot(originPosition());
    simulation.moveRobot()
    simulation.undoRobot()
    expect(simulation.getRobot()).toBeUndefined()
  })

  test("should ignore undo with no history", () => {
    const simulation = fiveByFiveTable();
    simulation.undoRobot()
    expect(simulation.getRobot()).toBeUndefined()
  })

})

const invalidPosition = (): Position => ({
  x: -1,
  y: -1,
  orientation: -1
})

const originPosition = (): Position => ({
  x: 0,
  y: 0,
  orientation: Orientation.NORTH
})

const fiveByFiveTable = (): ToyRobotSimulation => new ToyRobotSimulation(5, 5)
