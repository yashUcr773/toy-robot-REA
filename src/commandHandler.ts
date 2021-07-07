import { Store } from "redux";
import { Position } from "./types/position.js";
import { bearingToDirection, directionToBearing } from "./util/compassBearing.js";
import { moveAction, placeAction, rotateLeftAction, rotateRightAction, SimulationAction } from "./simulationActions.js";
import { SimulationState } from "./simulationReducer.js";

export type Command = {
  command: string,
  arguments: Array<string>
};

export function parseCommands(command: string): Command {
  const match = command.match(/^((PLACE \d,\d,(EAST|WEST|NORTH|SOUTH))|RIGHT|LEFT|MOVE|REPORT)$/);

  if (match) {
    const split = match[0].split(" ");
    if (split.length > 1) {
      return { command: split[0], arguments: split[1].split(",") } as Command;
    }
  
    return { command: split[0], arguments: []} as Command;
  }

  return { command: "BAD INPUT", arguments: [] } as Command;
}

export default function handleCommand(input: string, simulation: Store<SimulationState, SimulationAction>): void {
  const commandObj: Command = parseCommands(input);
  switch (commandObj.command) {
    case "RIGHT":
      simulation.dispatch(rotateRightAction());
      break;
    case "LEFT":
      simulation.dispatch(rotateLeftAction());
      break;
    case "MOVE":
      simulation.dispatch(moveAction());
      break;
    case "PLACE": {
      const x = parseInt(commandObj.arguments[0]);
      const y = parseInt(commandObj.arguments[1]);
      const bearing = directionToBearing(commandObj.arguments[2]);
      const position = { x: x, y: y } as Position;
      simulation.dispatch(placeAction(position, bearing));
      break;
    }
    case "REPORT": {
      const state = simulation.getState();
      if (state.robot.placed) {
        const direction = bearingToDirection(state.robot.bearing);
        console.log(`${state.robot.position.x},${state.robot.position.y},${direction}`);  
      }
      break;
    }
    default:
      console.log("Invalid Command");
      break;
  }
}