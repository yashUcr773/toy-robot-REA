# Toy Robot Coding Challenge
This is a Typescript implementation of a Toy Robot simulation using NodeJS and Redux. 

## Prerequisites
* **npm** or **yarn**
* Node.js
* A command line

## Installation

As the code was written in Typescript we need to transpile it into Javascript before we can run it with Node.js.

1. Install the node package dependencies including Typescript with:

```shell
npm install
```

2. To build and transpile the Typescript into Javascript use:

```shell
npm run build
```

The transpiled Javascript code will be created in the local `build` directory.

## Running The Application

To run the application you can run the npm script

```shell
npm run start
```

or alternatively run the `index.js` file directly

```shell
node ./build/index.js
```

### Description

- The application simulates a robot moving on a square tabletop of dimensions 5 units x 5 units.
- There are no other obstructions on the table surface.
- The robot is free to roam around the surface of the table but will ignore any commands that:
  - would result in the robot falling from the table 
  - may place it off the edge of the table
  - are given before it is placed on the table

## Usage

The program will run on a command line and expect input in the form lines of text.

Valid commands include:

    PLACE X,Y,F
    MOVE
    LEFT
    RIGHT
    REPORT

- PLACE will put the toy robot on the table in position X,Y and facing NORTH,
  SOUTH, EAST or WEST.
- MOVE will move the toy robot one unit forward in the direction it is
  currently facing.
- LEFT and RIGHT will rotate the robot 90 degrees in the specified direction
  without changing the position of the robot.
- REPORT will announce the X,Y and F of the robot.

To terminate the program press `CTRL + C` or close the command line


## Testing

Test cases have been defined using Jest and can be run with 

```shell
npm test
```

Example Input and Output
------------------------

### Example a

    PLACE 0,0,NORTH
    MOVE
    REPORT

Expected output:

    0,1,NORTH

### Example b

    PLACE 0,0,NORTH
    LEFT
    REPORT

Expected output:

    0,0,WEST

### Example c

    PLACE 1,2,EAST
    MOVE
    MOVE
    LEFT
    MOVE
    REPORT

Expected output

    3,3,NORTH
