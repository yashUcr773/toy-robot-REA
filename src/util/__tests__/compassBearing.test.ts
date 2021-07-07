import { bearingToDirection, directionToBearing } from "../compassBearing";

test('translate bearings to cardinal directions', () => {
  expect(bearingToDirection(0)).toBe("NORTH");
  expect(bearingToDirection(90)).toBe("EAST");
  expect(bearingToDirection(180)).toBe("SOUTH");
  expect(bearingToDirection(270)).toBe("WEST");
});

test('translate cardinal directions to bearings', () => {
  expect(directionToBearing("NORTH")).toBe(0);
  expect(directionToBearing("EAST")).toBe(90);
  expect(directionToBearing("SOUTH")).toBe(180);
  expect(directionToBearing("WEST")).toBe(270);
});

test('bad input for bearing translations should return a negative state', () => {
  expect(directionToBearing("abc")).toBe(-1);
  expect(bearingToDirection(1)).toBe("");
});
