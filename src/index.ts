import * as readline from 'readline';
import {ToyRobotSimulation} from "./toyRobotSimulation";
import {toyRobotSimulationCommandAdaptor} from "./commandAdaptor";


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
