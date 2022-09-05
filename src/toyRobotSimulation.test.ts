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