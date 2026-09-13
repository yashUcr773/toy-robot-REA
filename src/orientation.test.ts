import { left, Orientation, right } from "./orientation";

describe("orientation", () => {
  test("should turn right from north to east", () => {
    expect(right(Orientation.NORTH)).toEqual(Orientation.EAST);
  });
  test("should turn right from east to south", () => {
    expect(right(Orientation.EAST)).toEqual(Orientation.SOUTH);
  });
  test("should turn right from south to west", () => {
    expect(right(Orientation.SOUTH)).toEqual(Orientation.WEST);
  });
  test("should turn right from west to north", () => {
    expect(right(Orientation.WEST)).toEqual(Orientation.NORTH);
  });

  test("should turn left from north to west", () => {
    expect(left(Orientation.NORTH)).toEqual(Orientation.WEST);
  });
  test("should turn left from west to south", () => {
    expect(left(Orientation.WEST)).toEqual(Orientation.SOUTH);
  });
  test("should turn left from south to east", () => {
    expect(left(Orientation.SOUTH)).toEqual(Orientation.EAST);
  });
  test("should turn left from east to north", () => {
    expect(left(Orientation.EAST)).toEqual(Orientation.NORTH);
  });
});
