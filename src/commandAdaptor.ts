import { Orientation } from "./orientation";
import { ToyRobotSimulation } from "./toyRobotSimulation";

/**
 * Wraps a ToyRobotSimulation with a text-command interface.
 *
 * This is the translation layer between raw input strings ("PLACE 1,2,NORTH",
 * "MOVE", ...) and the simulation's typed API. It is built as a factory
 * (closure) rather than a class: it captures the simulation and a logger,
 * and returns an object exposing only `processCommand`.
 *
 * @param toyRobotSimulation the simulation instance to drive
 * @param logger sink for REPORT output (e.g. `console.log`)
 * @returns an object with a `processCommand(commandString)` method
 */
export const toyRobotSimulationCommandAdaptor = (
  toyRobotSimulation: ToyRobotSimulation,
  logger: (message: string) => void,
) => {
  /**
   * Parses and executes one command line.
   *
   * Flow:
   * 1. Take the first whitespace-separated word as the command keyword.
   * 2. Dispatch to the matching simulation action:
   *    - PLACE  -> parse arguments and place the robot (see `place`)
   *    - MOVE   -> move one unit forward
   *    - LEFT   -> rotate 90 degrees counter-clockwise
   *    - RIGHT  -> rotate 90 degrees clockwise
   *    - REPORT -> log the current position (see `report`)
   * 3. Unrecognised commands fall through the switch and are silently ignored.
   *
   * @param commandString one raw input line
   */
  const processCommand = (commandString: string): void => {
    const command = commandString.split(" ")[0];
    switch (command) {
      case "PLACE":
        place(commandString);
        report();
        return;
      case "MOVE":
        toyRobotSimulation.moveRobot();
        report();
        return;
      case "LEFT":
        toyRobotSimulation.turnRobotLeft();
        report();
        return;
      case "RIGHT":
        toyRobotSimulation.turnRobotRight();
        report();
        return;
      case "REPORT":
        return report();
    }
  };

  /**
   * Handles a PLACE command of the form "PLACE X,Y,F".
   *
   * Flow:
   * 1. Match the full command against `PLACE <digits>,<digits>,<direction>`,
   *    where direction is one of NORTH/EAST/SOUTH/WEST.
   * 2. If it doesn't match (bad format, negative numbers, unknown direction),
   *    silently ignore the command.
   * 3. Otherwise convert X and Y to integers, map the direction name to the
   *    Orientation enum, and ask the simulation to place the robot (which
   *    applies its own bounds check).
   *
   * @param commandString the full raw command line starting with "PLACE"
   */
  const place = (commandString: string): void => {
    const match = commandString.match(
      /PLACE (\d+),(\d+),(NORTH|EAST|SOUTH|WEST)/,
    );
    if (match) {
      toyRobotSimulation.placeRobot({
        x: parseInt(match[1], 10),
        y: parseInt(match[2], 10),
        orientation: Orientation[match[3] as keyof typeof Orientation],
      });
    }
  };

  /**
   * Handles a REPORT command.
   *
   * Flow:
   * 1. Fetch the robot's position from the simulation.
   * 2. If the robot has not been placed yet, output nothing.
   * 3. Otherwise log "X,Y,DIRECTION" (e.g. "0,1,NORTH"), converting the
   *    numeric Orientation enum value back to its name.
   */
  const report = () => {
    const robotPos = toyRobotSimulation.getRobot();
    if (robotPos) {
      logger(
        `${robotPos.x},${robotPos.y},${Orientation[robotPos.orientation]}`,
      );
    }
  };

  return {
    processCommand,
  };
};
