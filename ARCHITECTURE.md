# Architecture Design

This program uses Redux standalone as a state machine to simulate the robot on a tabletop. Following Redux best practice, the program adheres to functional programming principles by using immutable updates for state management and heavy usage of pure functions. 

## Design decisions

1. All directions are converted into compass bearings (0 - 360) in internal logic. All rotations are simply done by adding or subtracting 90 degrees to the bearing. Will allow easier support for potential changes to rotation, if say the robot was allowed to rotate 45 degrees.
2. The simulation reducer encapsulates the entire simulation logic, and is the only way to update the state. The REPORT command is not part of the simulation actions because it does not have anything to do with updating the simulation.
3. Commands are loosely parsed by format and validated on the simulation. The single responsibility of the command handler is to mediate between the simulation reducer and the command line. Bad input will be rejected as Invalid Commands, where as valid commands that are illegal will be ignored by the simulation.
4. There are a number of constants used that can be easily changed or reconfigured depending on the specifications. e.g. moving 2 spaces by default or different table sizes. 
