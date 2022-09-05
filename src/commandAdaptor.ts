import { Orientation } from './orientation';
import { ToyRobotSimulation } from './toyRobotSimulation';

export const toyRobotSimulationCommandAdaptor = (toyRobotSimulation: ToyRobotSimulation, logger: (message: string) => void) => {

  const processCommand = (commandString: string): void => {
    const command = commandString.split(" ")[0];
    switch (command) {
      case "PLACE": return place(commandString);
      case "MOVE": return toyRobotSimulation.moveRobot();
      case "LEFT": return toyRobotSimulation.turnRobotLeft();
      case "RIGHT": return toyRobotSimulation.turnRobotRight();
      case "REPORT": return report();
    }
  }

  const place = (commandString: string): void => {
    const match = commandString.match(/PLACE (\d+),(\d+),(NORTH|EAST|SOUTH|WEST)/);
    if (match) {
      toyRobotSimulation.placeRobot({
        x: parseInt(match[1], 10),
        y: parseInt(match[2], 10),
        orientation: Orientation[match[3] as keyof typeof Orientation]
      })
    }
  }

  const report = () => {
    const robotPos = toyRobotSimulation.getRobot();
    if (robotPos) {
      logger(`${robotPos.x},${robotPos.y},${Orientation[robotPos.orientation]}`)
    }
  }

  return {
    processCommand
  }
}
