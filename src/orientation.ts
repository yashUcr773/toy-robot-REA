
export enum Orientation {
  NORTH,
  EAST,
  SOUTH,
  WEST
}

export function left(orientation: Orientation): Orientation {
  const ordinal = orientation - 1;
  return ordinal < 0 ? Orientation.WEST : Orientation[Orientation[ordinal] as keyof typeof Orientation];
}

export function right(orientation: Orientation): Orientation {
  const numberOfItemsInEnum = Object.keys(Orientation).length / 2;
  const ordinal = orientation + 1;
  return ordinal >= numberOfItemsInEnum ? Orientation.NORTH : Orientation[Orientation[ordinal] as keyof typeof Orientation];
}

export function forwardMovement(orientation: Orientation): { x: number, y: number } {
  switch (orientation) {
    case Orientation.NORTH: return { x: 0, y: 1 }
    case Orientation.EAST: return { x: 1, y: 0 }
    case Orientation.SOUTH: return { x: 0, y: -1 }
    case Orientation.WEST: return { x: -1, y: 0 }
  }
}
