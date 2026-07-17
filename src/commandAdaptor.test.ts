import {toyRobotSimulationCommandAdaptor} from "./commandAdaptor";
import {ToyRobotSimulation} from "./toyRobotSimulation";

describe("integration", () => {
  test("should run example A", () => {
    runAndCompareOutput("PLACE 0,0,NORTH\n" +
        "MOVE\n" +
        "REPORT", "0,1,NORTH\n")
  })

  test("should run example B", () => {
    runAndCompareOutput("PLACE 0,0,NORTH\n" +
        "LEFT\n" +
        "REPORT", "0,0,WEST\n")
  })

  test("should run example C", () => {
    runAndCompareOutput("PLACE 1,2,EAST\n" +
        "MOVE\n" +
        "MOVE\n" +
        "LEFT\n" +
        "MOVE\n" +
        "REPORT", "3,3,NORTH\n")
  })

  test("should run back command", () => {
    runAndCompareOutput("PLACE 1,2,EAST\n" +
        "BACK\n" +
        "REPORT", "0,2,EAST\n")
  })

  test("should run undo command", () => {
    runAndCompareOutput("PLACE 0,0,NORTH\n" +
        "MOVE\n" +
        "RIGHT\n" +
        "UNDO\n" +
        "REPORT", "0,1,NORTH\n")
  })

  test("should run obstacle command", () => {
    runAndCompareOutput("OBSTACLE 0,1\n" +
        "PLACE 0,0,NORTH\n" +
        "MOVE\n" +
        "REPORT", "0,0,NORTH\n")
  })

  test("should not place robot on obstacle from command", () => {
    runAndCompareOutput("OBSTACLE 0,0\n" +
        "PLACE 0,0,NORTH\n" +
        "REPORT", "")
  })

})

const runAndCompareOutput = (input: string, expectedOutput: string) => {
  let output = "";
  const logger = (message: string) => {
    output += message + "\n"
  }
  const trsca = toyRobotSimulationCommandAdaptor(new ToyRobotSimulation(), logger);
  input.split("\n").forEach(line => trsca.processCommand(line))
  expect(output).toEqual(expectedOutput)
}
