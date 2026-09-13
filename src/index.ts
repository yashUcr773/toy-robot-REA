import * as readline from 'readline';
import {ToyRobotSimulation} from "./toyRobotSimulation";
import {toyRobotSimulationCommandAdaptor} from "./commandAdaptor";


/**
 * CLI entry point for the Toy Robot Simulator.
 *
 * Flow:
 * 1. Create a fresh simulation (default 5x5 table) and wrap it in the
 *    command adaptor, wiring REPORT output to `console.log`.
 * 2. Print a ready message so the user knows the app is accepting input.
 * 3. Open a readline interface on stdin and feed every line the user types
 *    to `processCommand`.
 * 4. Runs until stdin closes (Ctrl+C / Ctrl+D / end of piped input).
 */
function main() {
  const trsca = toyRobotSimulationCommandAdaptor(new ToyRobotSimulation(), console.log)

  console.log("Toy Robot Simulator is now ready for commands!")

  const rl = readline.createInterface({
    input: process.stdin,
  })
  rl.on('line', (line) => {
    trsca.processCommand(line)
  })
}

main()
