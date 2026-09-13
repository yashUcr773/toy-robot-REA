
/**
 * The four compass directions the robot can face.
 *
 * Declared in clockwise order (NORTH -> EAST -> SOUTH -> WEST) so that
 * turning right is "+1" and turning left is "-1" on the numeric enum value.
 * NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3.
 */
export enum Orientation {
  NORTH,
  EAST,
  SOUTH,
  WEST
}

/**
 * Rotates an orientation 90 degrees counter-clockwise (anti-clockwise).
 *
 * Flow:
 * 1. Step one position backwards in the clockwise enum order (ordinal - 1).
 * 2. If we stepped below the first value (NORTH -> -1), wrap around to WEST.
 * 3. Otherwise convert the ordinal back to its enum member and return it.
 *
 * Examples: NORTH -> WEST, WEST -> SOUTH, EAST -> NORTH.
 *
 * @param orientation the current facing direction
 * @returns the orientation after a 90-degree left turn
 */
export function left(orientation: Orientation): Orientation {
  // Step 1: move one place counter-clockwise in the enum ordering.
  const ordinal = orientation - 1;
  // Steps 2 & 3: wrap NORTH around to WEST, otherwise map the ordinal back to an enum member.
  return ordinal < 0 ? Orientation.WEST : Orientation[Orientation[ordinal] as keyof typeof Orientation];
}

/**
 * Rotates an orientation 90 degrees clockwise.
 *
 * Flow:
 * 1. Count the enum members (numeric enums have both name->value and
 *    value->name keys, hence the division by 2).
 * 2. Step one position forwards in the clockwise enum order (ordinal + 1).
 * 3. If we stepped past the last value (WEST -> 4), wrap around to NORTH.
 * 4. Otherwise convert the ordinal back to its enum member and return it.
 *
 * Examples: NORTH -> EAST, WEST -> NORTH, SOUTH -> WEST.
 *
 * @param orientation the current facing direction
 * @returns the orientation after a 90-degree right turn
 */
export function right(orientation: Orientation): Orientation {
  // Step 1: a numeric enum object holds forward and reverse mappings, so halve the key count.
  const numberOfItemsInEnum = Object.keys(Orientation).length / 2;
  // Step 2: move one place clockwise in the enum ordering.
  const ordinal = orientation + 1;
  // Steps 3 & 4: wrap WEST around to NORTH, otherwise map the ordinal back to an enum member.
  return ordinal >= numberOfItemsInEnum ? Orientation.NORTH : Orientation[Orientation[ordinal] as keyof typeof Orientation];
}

/**
 * Returns the unit vector (delta x, delta y) for one step forward in the
 * given orientation, using a grid where (0,0) is the south-west corner:
 * x grows towards EAST and y grows towards NORTH.
 *
 * Flow:
 * 1. Switch on the orientation.
 * 2. Return the matching one-unit offset:
 *    NORTH -> (0, +1), EAST -> (+1, 0), SOUTH -> (0, -1), WEST -> (-1, 0).
 *
 * @param orientation the direction the robot is facing
 * @returns the x/y offset to add to a position to move one unit forward
 */
export function forwardMovement(orientation: Orientation): { x: number, y: number } {
  switch (orientation) {
    case Orientation.NORTH: return { x: 0, y: 1 }
    case Orientation.EAST: return { x: 1, y: 0 }
    case Orientation.SOUTH: return { x: 0, y: -1 }
    case Orientation.WEST: return { x: -1, y: 0 }
  }
}
