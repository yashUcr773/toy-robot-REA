# Toy Robot Simulator

## Description

- The application is a simulation of a toy robot moving on a square tabletop, of dimensions 5x5 units.
- There are no other obstructions on the table surface.
- The robot is free to roam around the surface of the table, but must be prevented from falling to destruction. Any movement that would result in the robot falling from the table must be prevented, however further valid movement commands must still be allowed.
- The application can read in commands of the following (textual) form:
```
    PLACE X,Y,F
    MOVE
    LEFT
    RIGHT
    REPORT
```
- `PLACE` will put the toy robot on the table in position `X`,`Y` and facing `NORTH`, `SOUTH`, `EAST` or `WEST`.
- The origin (0,0) can be considered to be the `SOUTH WEST` most corner.
- The first valid command to the robot is a `PLACE` command, after that, any sequence of commands may be issued, in any order, including another `PLACE` command. The application should discard all commands in the sequence until a valid `PLACE` command has been executed.
- `MOVE` will move the toy robot one unit forward in the direction it is currently facing.
- `LEFT` and `RIGHT` will rotate the robot 90 degrees in the specified direction without changing the position of the robot.
- `REPORT` will announce the `X,Y` and `F` of the robot. This can be in any form, but standard output is sufficient.
- A robot that is not on the table can choose to ignore the `MOVE`, `LEFT`, `RIGHT` and `REPORT` commands.
- The toy robot does not fall off the table during movement. This also includes the initial placement of the toy robot. Any move that would cause the robot to fall is ignored.

## Example Input and Output

### Example A

```
    PLACE 0,0,NORTH
    MOVE
    REPORT
```

Expected output:

```
    0,1,NORTH
```

### Example B

```
    PLACE 0,0,NORTH
    LEFT
    REPORT
```

Expected output:

```
    0,0,WEST
```

### Example C

```
    PLACE 1,2,EAST
    MOVE
    MOVE
    LEFT
    MOVE
    REPORT
```

Expected output:

```
    3,3,NORTH    
```

## Prerequisites

Building/running requires a system with node (tested with nodejs16).

### Install dependencies

```bash
npm install
```

### Running tests

```bash
npm run test
```

### Running interactive CLI

```bash
npm run start
```

### Using docker

If you don't have a nodejs environment set up locally, you can use the below command to start one.

```bash
docker run --rm -it -v $(pwd):/home -w /home --entrypoint /bin/bash node:16
```
