# Toy Robot Simulator — Code Documentation

A TypeScript implementation of the classic Toy Robot kata: a robot moves around
a 5x5 tabletop, driven by text commands (`PLACE`, `MOVE`, `LEFT`, `RIGHT`,
`REPORT`), and must never fall off the edge.

## Project Structure

```
.
├── src/
│   ├── index.ts                    # CLI entry point (reads commands from stdin)
│   ├── commandAdaptor.ts           # Parses text commands -> simulation calls
│   ├── toyRobotSimulation.ts       # Core simulation (table, robot state, rules)
│   ├── orientation.ts              # Compass directions and rotation/movement math
│   ├── position.ts                 # Position type (x, y, orientation)
│   ├── commandAdaptor.test.ts      # Integration tests (README examples A/B/C)
│   ├── toyRobotSimulation.test.ts  # Unit tests for the simulation
│   └── orientation.test.ts         # Unit tests for turning logic
├── package.json                    # Scripts: `npm start`, `npm test`
├── tsconfig.json                   # TypeScript config (strict mode)
├── jest.config.js                  # Jest + ts-jest config
└── README.md                       # Kata specification and usage
```

## Architecture Overview

The code is layered so that each file has one responsibility:

```
stdin line
   │
   ▼
index.ts (main)                        ── I/O layer
   │  passes each line to
   ▼
commandAdaptor.ts (processCommand)     ── parsing/translation layer
   │  calls typed methods on
   ▼
toyRobotSimulation.ts (ToyRobotSimulation) ── domain/rules layer
   │  uses helpers from
   ▼
orientation.ts + position.ts           ── pure data & math
```

- The **simulation** knows nothing about text commands or I/O.
- The **adaptor** knows nothing about where strings come from or where output
  goes (the logger is injected, which is what makes the integration tests easy).
- **Invalid input at any layer is silently ignored** — malformed commands,
  placements off the table, and moves that would fall off the edge all become
  no-ops, per the kata spec.

## End-to-End Command Flow

Example: the user types `PLACE 1,2,EAST` then `MOVE` then `REPORT`.

1. `main()` in `index.ts` receives each line via readline's `line` event and
   calls `processCommand(line)`.
2. `processCommand` splits off the first word to identify the command.
3. For `PLACE`, `place()` regex-parses `X,Y,F`, builds a `Position`
   `{x: 1, y: 2, orientation: Orientation.EAST}`, and calls
   `toyRobotSimulation.placeRobot(...)`. The simulation checks bounds via
   `isPositionValid` and stores the position.
4. For `MOVE`, the simulation computes the square in front of the robot
   (`inFrontOf` + `forwardMovement`), checks it is still on the table, and
   commits it — so the robot is now at `{2, 2, EAST}`.
5. For `REPORT`, the adaptor reads the state via `getRobot()` and logs
   `2,2,EAST` through the injected logger (`console.log` in the CLI).

Commands issued before a successful `PLACE` do nothing, because every
simulation method guards on the robot being placed (`this.robot` is
`undefined` until then).

## File-by-File Reference

### `src/position.ts`

| Export | Kind | Description |
|---|---|---|
| `Position` | interface | `{ x, y, orientation }` — the robot's full state. `(0,0)` is the south-west corner; x grows EAST, y grows NORTH. |

### `src/orientation.ts`

Pure functions — no state.

| Export | Kind | Description |
|---|---|---|
| `Orientation` | enum | `NORTH(0), EAST(1), SOUTH(2), WEST(3)`, declared in clockwise order so rotation is ±1 arithmetic. |
| `left(orientation)` | function | 90° counter-clockwise turn. Decrements the enum ordinal and wraps `NORTH -> WEST`. |
| `right(orientation)` | function | 90° clockwise turn. Increments the ordinal and wraps `WEST -> NORTH`. (The enum member count is `Object.keys(...).length / 2` because numeric enums store both name→value and value→name mappings.) |
| `forwardMovement(orientation)` | function | Unit vector for one step forward: `NORTH -> (0,+1)`, `EAST -> (+1,0)`, `SOUTH -> (0,-1)`, `WEST -> (-1,0)`. |

### `src/toyRobotSimulation.ts`

The domain model. Holds the table dimensions and the robot's position
(`undefined` until placed). Every mutating method preserves the invariant
that the robot is either unplaced or at a valid on-table position.

| Member | Description |
|---|---|
| `DEFAULT_TABLE_SIZE` | Module constant, `5` — the kata's 5x5 table. |
| `inFrontOf(position)` | Module helper: returns a new `Position` one unit ahead (no bounds check; the caller validates). |
| `constructor(tableSizeX?, tableSizeY?)` | Creates a simulation; both dimensions default to 5. Robot starts off the table. |
| `placeRobot(position)` | Sets the robot's position if it is on the table; otherwise ignored. Also used for re-placing an already-placed robot. |
| `moveRobot()` | Steps one unit forward if placed **and** the destination is on the table; otherwise a no-op. This is the "don't fall off" rule. |
| `turnRobotLeft()` | Rotates 90° counter-clockwise in place (no-op if unplaced). |
| `turnRobotRight()` | Rotates 90° clockwise in place (no-op if unplaced). |
| `getRobot()` | Returns the current `Position`, or `undefined` if unplaced. Used by REPORT. |
| `isPositionValid(position)` | Bounds check: `0 <= x < tableSizeX` and `0 <= y < tableSizeY` (so a 5-wide table allows 0..4). |

### `src/commandAdaptor.ts`

The text-to-API translation layer, written as a factory function that closes
over the simulation and a logger and returns `{ processCommand }`.

| Member | Description |
|---|---|
| `toyRobotSimulationCommandAdaptor(sim, logger)` | Factory. `logger` is where REPORT output goes — `console.log` in production, a spy in tests. |
| `processCommand(commandString)` | Takes one raw line, dispatches on the first word: `PLACE`/`MOVE`/`LEFT`/`RIGHT`/`REPORT`. Unknown commands are silently ignored. |
| `place(commandString)` (private) | Regex-parses `PLACE (\d+),(\d+),(NORTH\|EAST\|SOUTH\|WEST)`; on match, converts to a `Position` and calls `placeRobot`. Malformed input (including negative coordinates, which `\d+` can't match) is ignored. |
| `report()` (private) | Logs `X,Y,DIRECTION` (e.g. `0,1,NORTH`) if the robot is placed; outputs nothing otherwise. |

### `src/index.ts`

| Member | Description |
|---|---|
| `main()` | CLI entry point: builds a default 5x5 simulation wrapped in the adaptor (logger = `console.log`), prints a ready banner, then pipes every stdin line into `processCommand` until stdin closes. Run with `npm run start`. |

## Tests

Run with `npm test` (Jest + ts-jest).

| File | Scope | What it covers |
|---|---|---|
| `orientation.test.ts` | unit | Turning left/right, including both wrap-around cases (`WEST -> NORTH` right, `NORTH -> WEST` left). |
| `toyRobotSimulation.test.ts` | unit | Position validity (negative axes, beyond-table, corners, origin, middle), ignoring invalid placements, moving north, boundary clamping, turning left/right. |
| `commandAdaptor.test.ts` | integration | Feeds the README's example command sequences (A, B, C) through `processCommand` with a mock logger and asserts the reported output. |

## Key Design Decisions

- **Dependency injection for output**: the adaptor takes a `logger` function
  instead of calling `console.log` directly, so tests can capture REPORT
  output without patching globals.
- **Immutable-style updates**: `moveRobot`/`turnRobot*` build a new `Position`
  object (spread/`inFrontOf`) rather than mutating fields in place.
- **Validate-then-commit**: candidate positions are computed first and only
  stored after `isPositionValid` passes, which keeps the "never fall off"
  invariant in one place.
- **Silent failure semantics**: per the kata, invalid commands are ignored
  rather than raising errors, at every layer.

---

# Developer Guide

Everything you need to know to work on and extend this project.

## Getting Started

```bash
nvm use          # picks up .nvmrc (Node 16); newer Node versions also work
npm install      # dev dependencies only — there are zero runtime dependencies
npm test         # run all tests (Jest + ts-jest)
npm run start    # interactive CLI via ts-node
```

You can also pipe commands in non-interactively:

```bash
printf "PLACE 1,2,EAST\nMOVE\nREPORT\n" | npm run start
```

No Node environment? Use the Docker one-liner from the README:

```bash
docker run --rm -it -v $(pwd):/home -w /home --entrypoint /bin/bash node:16
```

## Tooling & Configuration

| File | What it does | Things to know |
|---|---|---|
| `package.json` | Scripts + dev deps | Only two scripts: `test` (jest) and `start` (ts-node). **No runtime dependencies at all** — everything is devDependencies. `"private": true`, so it can't be accidentally published. |
| `tsconfig.json` | TypeScript compiler | `strict: true` (so `Position \| undefined` checks are enforced) and **`noEmit: true`** — the project is never compiled to JS on disk; it runs via `ts-node` and tests via `ts-jest`. There is no build/dist step. |
| `jest.config.js` | Test runner | Just the `ts-jest` preset with a `node` environment. Any `*.test.ts` file under `src/` is picked up automatically — no registration needed. |
| `.nvmrc` | Node version pin | `v16`, which is EOL; the code has no v16-specific dependencies and runs fine on current LTS. Bumping it is safe. |
| `.gitignore` | Ignores `node_modules` etc. | Nothing unusual. |

There is **no linter, formatter, CI pipeline, or build output** configured.
If you extend the project seriously, adding ESLint + Prettier and a GitHub
Actions workflow that runs `npm test` and `npx tsc --noEmit` is the first
low-effort improvement.

## Behaviors, Quirks & Gotchas

Things that aren't obvious from the README and will bite you if you don't
know them:

- **The PLACE regex is not anchored.** `commandString.match(/PLACE (\d+),(\d+),(NORTH|EAST|SOUTH|WEST)/)` matches anywhere in the string, so `PLACE 1,2,NORTHWEST` matches as `NORTH` (trailing junk ignored) and extra text before/after is tolerated. If you need stricter parsing, anchor it: `/^PLACE (\d+),(\d+),(NORTH|EAST|SOUTH|WEST)$/`.
- **Negative coordinates never reach the simulation from the CLI.** `\d+` can't match a minus sign, so `PLACE -1,0,NORTH` fails the regex and is dropped at the parse layer. `isPositionValid` still checks `>= 0` because `placeRobot` is a public API that tests (and future code) call directly with arbitrary numbers.
- **Commands are case-sensitive and must be exact.** `place 0,0,north` or leading whitespace before the keyword are silently ignored (the dispatcher compares the first space-split token literally).
- **Everything fails silently by design.** Unknown commands, malformed PLACE arguments, off-table placements, and edge-of-table moves all produce *no output and no error*. This is per the kata spec, but it makes the CLI feel unresponsive — if you're debugging "why did nothing happen", it's almost always one of these.
- **REPORT before PLACE prints nothing** — not an error, not an empty line.
- **The `Orientation` enum's declaration order is load-bearing.** `left`/`right` do ±1 arithmetic on the numeric enum values and `right` counts members via `Object.keys(Orientation).length / 2` (numeric enums store both name→value and value→name keys). Reordering the members, assigning explicit non-contiguous values, or converting to a string enum breaks turning. See "Adding new orientations" below before touching it.
- **`getRobot()` leaks a mutable reference.** It returns the internal `Position` object directly. Nothing currently mutates it (all updates replace the object wholesale), but external code *could*. If you expose the simulation more widely, return a copy: `return this.robot ? { ...this.robot } : undefined`.
- **The CLI never exits on its own.** `readline` keeps stdin open; end with Ctrl+C or Ctrl+D. There is no `EXIT`/`QUIT` command (easy to add — see below).
- **The table is rectangular-capable but the CLI only uses the 5x5 default.** `ToyRobotSimulation` accepts `(tableSizeX, tableSizeY)`, but `index.ts` calls `new ToyRobotSimulation()` with no args. To change the CLI's table size, edit that one call.
- **Coordinate convention:** `(0,0)` is the *south-west* corner. `y` increases going NORTH. If you add any rendering/visualization, remember that printing rows top-to-bottom means iterating `y` from high to low.

## How to Extend

The layering makes most extensions mechanical: **new behavior goes in the
simulation, new syntax goes in the adaptor, new I/O goes in `index.ts`** —
and each gets its own tests at the matching level.

### Recipe: add a new command (e.g. `EXIT`, or `PLACE_OBJECT`)

1. **Simulation** (`toyRobotSimulation.ts`): add a method implementing the
   behavior. Follow the existing pattern — guard on `this.robot` if the
   command requires a placed robot, compute the new state, validate, commit.
2. **Adaptor** (`commandAdaptor.ts`): add a `case "YOURCOMMAND":` to the
   `switch` in `processCommand`. If it takes arguments, add a private parse
   helper like `place()` (regex-match, silently ignore on failure).
3. **Tests**: unit-test the new simulation method in
   `toyRobotSimulation.test.ts`; add an end-to-end command sequence to
   `commandAdaptor.test.ts` using the `runAndCompareOutput` helper pattern
   (inject a string-collecting logger, feed lines, assert output).

For `EXIT` specifically, the simulation isn't involved at all — you'd have the
adaptor accept an injected `onExit` callback (like `logger`) and have
`index.ts` pass `() => rl.close()` / `process.exit(0)`.

### Recipe: change the table size or make it configurable

- Hardcoded change: pass args in `index.ts` — `new ToyRobotSimulation(8, 8)`.
- CLI-configurable: read `process.argv` in `main()` and pass the parsed
  numbers through. The simulation and validation already handle any
  rectangular size; nothing else needs to change.

### Recipe: add obstacles on the table

1. Add an `obstacles: Position[]` (or a `Set` of `"x,y"` keys) field to
   `ToyRobotSimulation`, plus an `addObstacle(x, y)` method.
2. Extend `isPositionValid` (or add a separate `isPositionFree` check in
   `placeRobot`/`moveRobot`) to reject occupied squares. Keeping bounds and
   occupancy as separate predicates keeps each rule testable in isolation.
3. Expose it as a command via the adaptor recipe above.

### Recipe: multiple robots

The current design assumes one robot (`private robot: Position | undefined`).
To generalize:

1. Replace the single field with a `Map<string, Position>` keyed by robot
   name/id, and add the robot id as a parameter to each method.
2. Decide the collision rule (can two robots share a square?) and enforce it
   in the same validate-then-commit spot as the bounds check.
3. The adaptor grows an "active robot" notion or per-command robot argument
   (e.g. `ROBOT 2` / `PLACE 0,0,NORTH,ROBOT2`) — this is purely a parsing
   concern; keep it out of the simulation.

### Adding new orientations (e.g. diagonals: NORTH_EAST, ...)

Three places must stay in sync — this is the most fragile extension:

1. `Orientation` enum: insert new members **in clockwise order** (e.g.
   `NORTH, NORTH_EAST, EAST, SOUTH_EAST, ...`), keeping values contiguous
   from 0. `left`/`right` will then keep working unchanged, because they're
   pure modular arithmetic over the member count.
2. `forwardMovement`: add a `case` per new direction with its unit vector
   (diagonals: `NORTH_EAST -> {x: 1, y: 1}`, etc.). The exhaustive `switch`
   with no default means `tsc` will flag any direction you forget — that's
   intentional; don't add a `default`.
3. The PLACE regex alternation in `commandAdaptor.ts` must list the new
   direction names, and REPORT output gets them for free via the enum's
   reverse mapping.

If you find yourself doing this, consider first refactoring the rotation
logic to an explicit ordered array (`const CLOCKWISE = [NORTH, NORTH_EAST,
...]`) with index arithmetic — it removes the enum-reverse-mapping trick and
makes the ordering dependency visible.

### Recipe: different input/output channels (file input, web UI, etc.)

Only `index.ts` knows about stdin/stdout, so alternative frontends are new
entry points, not modifications:

- **File input:** new entry that reads a file, splits lines, and calls
  `processCommand` per line — exactly what `commandAdaptor.test.ts` already
  does with strings.
- **HTTP/web/bot frontend:** instantiate one `ToyRobotSimulation` +
  adaptor per session, pass a logger that captures output for the response.
  Note the adaptor returns REPORT output via the logger *callback*, not as a
  return value — if you need request/response semantics, either collect from
  the logger (like the tests do) or change `processCommand` to return
  `string | void`.

### Recipe: user-visible error messages instead of silent ignores

The kata mandates silence, but for a friendlier CLI: have `processCommand`
(and `place`) call the injected `logger` (or a second injected `errorLogger`)
with a message on the failure paths — unknown command, regex mismatch,
rejected placement. Rejected *moves* are decided inside the simulation, so
either have `moveRobot`/`placeRobot` return a `boolean` (did it happen?) for
the adaptor to report on, or keep the simulation silent and accept that only
parse-level errors get messages. Update the integration tests, which assert
exact output.

### Building for distribution

Today nothing is ever compiled (`noEmit: true`). To ship a runnable artifact:

1. In `tsconfig.json`: remove `noEmit`, add `"outDir": "dist"` (and exclude
   `*.test.ts` via an `exclude` or a separate `tsconfig.build.json`).
2. Add scripts: `"build": "tsc -p tsconfig.build.json"`,
   `"start:prod": "node dist/index.js"`.
3. Optionally add a `"bin"` entry + `#!/usr/bin/env node` shebang in
   `index.ts` to make it npm-installable as a CLI.

## Designing the Command Functions (PLACE / MOVE / LEFT / RIGHT / REPORT)

If you're (re)implementing the command handlers — or adding many more — there
are three progressively more structured designs. Each is legitimate; which
one is "right" depends on how many commands you expect and who consumes them.

### Good: switch dispatch + one method per command (what the code does today)

```ts
switch (command) {
  case "PLACE": return place(commandString);
  case "MOVE":  return toyRobotSimulation.moveRobot();
  ...
}
```

One `switch` in the adaptor routes to a simulation method per command;
argument parsing (`place`) lives beside the dispatch.

- **Why it's good:** dead simple, zero indirection, everything about a
  command is findable with one grep. For 5 commands this is honestly hard to
  beat — the kata-sized problem doesn't justify more machinery.
- **Tradeoffs / where it strains:**
  - Parsing and dispatching are interleaved — you can't test "was this
    string understood correctly?" without also executing the effect.
  - The `switch` has no exhaustiveness safety: forget a `case` and nothing
    warns you; unknown commands and known-but-broken commands are
    indistinguishable (both fall through silently).
  - Handlers return `void`, so the only output channel is the side-effecting
    logger — awkward for any frontend that wants a response value.
  - Every new command edits the same function: at ~10+ commands the switch
    becomes a merge-conflict magnet.

### Better: a command registry (table-driven dispatch)

Replace the switch with a map from command word to handler:

```ts
type Handler = (args: string) => void;

const handlers: Record<string, Handler> = {
  PLACE:  (args) => place(args),
  MOVE:   ()     => sim.moveRobot(),
  LEFT:   ()     => sim.turnRobotLeft(),
  RIGHT:  ()     => sim.turnRobotRight(),
  REPORT: ()     => report(),
};

const processCommand = (line: string): void => {
  const [word, ...rest] = line.split(" ");
  handlers[word]?.(rest.join(" "));
};
```

- **Why it's better:** commands become *data*. Adding one is a single entry,
  not a control-flow edit; you can enumerate `Object.keys(handlers)` for a
  `HELP` command or error message ("unknown command, try one of: ...");
  plugins/tests can register or override handlers without touching the core.
- **Tradeoffs:**
  - Slightly more indirection — "what happens on MOVE?" is now a lookup, not
    a visible branch.
  - Argument parsing is still ad hoc inside each handler, and the string
    `Record` keys mean typos in command names are runtime bugs, not compile
    errors.
  - Still side-effect-only: no return values, same logger coupling as before.
- **Reach for this when:** the command set is growing past ~7–8, you want a
  HELP command, or you need per-frontend command subsets.

### Best: parse → typed command → execute (parser/interpreter split)

Separate *understanding* the input from *doing* it. The parser turns a string
into a discriminated union; the executor applies a typed command to the
simulation:

```ts
// 1. Commands as data — a discriminated union
type Command =
  | { type: "PLACE"; x: number; y: number; orientation: Orientation }
  | { type: "MOVE" }
  | { type: "LEFT" }
  | { type: "RIGHT" }
  | { type: "REPORT" };

// 2. Parser: string -> Command | error. Pure, trivially unit-testable.
const parse = (line: string): Command | { type: "INVALID"; input: string } => { ... };

// 3. Executor: Command -> effect (and optionally a result)
const execute = (cmd: Command): string | undefined => {
  switch (cmd.type) {
    case "PLACE":  sim.placeRobot({ x: cmd.x, y: cmd.y, orientation: cmd.orientation }); return;
    case "MOVE":   sim.moveRobot(); return;
    case "LEFT":   sim.turnRobotLeft(); return;
    case "RIGHT":  sim.turnRobotRight(); return;
    case "REPORT": { const r = sim.getRobot(); return r && `${r.x},${r.y},${Orientation[r.orientation]}`; }
    default: { const _exhaustive: never = cmd; return _exhaustive; }
  }
};
```

- **Why it's best (at scale):**
  - **Parsing is testable in isolation** — assert `parse("PLACE 1,2,EAST")`
    produces the right object without touching a simulation.
  - **Compiler-enforced exhaustiveness:** the `never` default means adding a
    `Command` variant *breaks the build* until every executor handles it —
    the failure mode of the "good" switch is gone.
  - **Commands are values**, so you get replay, undo (keep a command log),
    scripting, serialization over HTTP, and property-based testing
    ("any command sequence never puts the robot off-table") almost for free.
  - Returning `string | undefined` instead of calling a logger decouples the
    core from the output channel — CLI prints it, an HTTP frontend returns
    it, tests just assert on it.
  - Taken one step further, `execute` can be a **pure reducer**
    `(state, command) => newState` with no class at all — maximally testable,
    and time-travel/undo become trivial — at the cost of threading state
    explicitly everywhere.
- **Tradeoffs:**
  - Roughly 2–3× the code of the switch version for the same five commands —
    for the kata as-is, this is over-engineering, and an interviewer may
    reasonably ask you to justify it.
  - Two hops (parse, execute) to trace one command; new contributors need
    the pattern explained.
  - The union type centralizes command definitions again — you traded the
    registry's runtime extensibility for compile-time safety (you can't
    plugin-register a new command without editing the type).

### Cross-cutting tradeoffs to weigh (whichever tier you pick)

| Decision | Options & guidance |
|---|---|
| **Error handling** | Silent ignore (kata-spec, current) → simplest, worst UX. Logging errors → friendly, but couples handlers to an output channel. Returning a result (`{ok} \| {error}`) → most flexible; callers decide. Throwing → avoid for *expected* bad input (user typos aren't exceptional). |
| **Output channel** | Injected logger callback (current) → fine for streaming CLIs, awkward for request/response. Return values → composable, test-friendly; needs the executor split above. Don't do both for the same data. |
| **Where validation lives** | Keep *syntax* validation (regex, number parsing) in the parser/adaptor and *domain* validation (bounds, collisions) in the simulation — the current code gets this right; preserve it in any refactor. Duplicating domain rules in the parser is the classic mistake (e.g. checking `x < 5` in the regex layer breaks the moment table size is configurable). |
| **State: class vs. pure reducer** | The class (current) is idiomatic and fine. A pure `(state, cmd) => state` reducer maximizes testability and enables undo/replay, but is a bigger rewrite — only worth it if you actually want those features. |
| **Exhaustiveness** | Whatever design you pick, keep one place where the compiler forces you to handle every command and every orientation (no `default:` in switches over unions/enums). This is the cheapest bug-prevention available in this codebase. |

**Bottom line:** stay with *good* for ≤7 commands; move to *better* when the
command list grows or you need HELP/introspection; move to *best* when a
second frontend, undo/replay, or non-silent error reporting appears on the
roadmap — those features are painful to bolt onto the switch version but
nearly free after the parser/executor split.

## Interview Prep: Extensions You're Likely to Be Asked For

This is the classic Toy Robot kata (this repo is an REA Group–style
submission — note the `rea-toy-robot` package name). The standard interview
format is: you submit this, then in a pairing/follow-up session they ask you
to **extend it live**. The extensions below are the ones that actually come
up, tiered by likelihood. For each: what it's really testing, and how it
lands in this codebase.

### Tier 1 — expect at least one of these (they test whether your design absorbs change)

| Feature | What it's testing | How it lands here |
|---|---|---|
| **Obstacles / walls** ("add a `WALL X,Y` command; robot can't move or be placed there") | Whether validation is centralized and extensible. | Follows the obstacles recipe above: state + check in the simulation, one new `case` in the adaptor. If your bounds check and occupancy check are tangled, this hurts — here they aren't. |
| **A second robot / multiple robots** ("`ROBOT 2`, robots can't collide, REPORT says which is active") | Whether "one robot" is baked in as an assumption everywhere. | The single `private robot` field is the choke point — see the multiple-robots recipe. Expect follow-ups on collision rules and what REPORT should output. |
| **Bigger or configurable table** | Trivial on purpose — a warm-up to see if you hardcoded `5`. | Already parameterized in the constructor; only `index.ts` pins the default. Answer in one line, then say where CLI args would go. |
| **New movement command** (`MOVE 3` with a step count, or `BACK`/`UTURN`) | Parsing with arguments + reusing movement logic. | `MOVE 3` = loop `moveRobot()` N times (decide: stop at edge vs. reject whole move — *say the tradeoff out loud*). `BACK` = `forwardMovement` negated or two rights + move + two lefts. |
| **REPORT variations** (grid rendering as ASCII art, JSON output, report all robots) | Output-channel coupling. | The injected logger makes this easy — but remember `(0,0)` is *south-west*, so an ASCII grid prints rows with `y` descending. Mentioning that unprompted scores points. |

### Tier 2 — common follow-ups (test judgment more than typing)

- **Diagonal directions** (NORTH_EAST etc.) — the trap is the enum arithmetic
  in `left`/`right`; see "Adding new orientations". Strong move: refactor to
  the explicit clockwise array *first*, then add directions.
- **Error messages instead of silent ignores** ("tell the user why nothing
  happened") — see the error-messages recipe; the interesting part is that
  rejected *moves* are decided inside the simulation, so you must choose
  between returning booleans/results or keeping the simulation silent.
- **Read commands from a file** (`npm start commands.txt`) — pure `index.ts`
  change; the test helper already proves the core handles it.
- **Undo / command history / replay** — this is the question the
  parser/executor split ("best" tier above) exists for. With the current
  switch design, undo means storing position snapshots (easy — positions are
  already immutable values: keep a stack, pop on UNDO). Say both options.
- **Wrap-around (toroidal) table** ("robot exits east, re-enters west") —
  replace the reject-on-invalid in `moveRobot` with modulo on the
  coordinates. Tests whether you can *change* a rule, not just add one.
- **A `PIT`/hole the robot can fall into** (robot dies, further commands
  ignored) — introduces a third robot state beyond placed/unplaced; watch
  they don't want `undefined` overloaded to mean both "never placed" and
  "dead".

### Tier 3 — senior/stretch (usually discussion, not code)

- **Expose it as an HTTP API / web UI** — leads to the logger-vs-return-value
  discussion and per-session simulation instances (see the frontends recipe).
- **Concurrent command sources** — two clients, one robot: the simulation is
  synchronous and single-threaded (Node), so the real answer is about
  serializing command order, not locks.
- **Persistence** (save/restore simulation state) — trivial to serialize
  (state is one small object) — the discussion is about where the boundary
  goes, not JSON.
- **Property-based testing** — "how would you prove the robot can *never*
  fall off?" Answer: generate random command sequences, assert
  `isPositionValid(getRobot())` always holds.

### Discussion questions to have answers ready for

These get asked about the code as-is, no typing required:

1. *"Why do invalid commands fail silently?"* — kata spec requires it; point
   at the error-messages recipe as what you'd do for a real product.
2. *"Why a class for the simulation but a closure for the adaptor?"* — be
   able to defend the inconsistency or say you'd unify it; there's no wrong
   answer, only an unconsidered one.
3. *"Walk me through what happens for `PLACE 1,2,EAST`"* — the End-to-End
   Command Flow section above is exactly this; know it cold.
4. *"What would you change with more time?"* — anchor the regex, `getRobot()`
   returning a mutable reference, add lint/CI, the enum-arithmetic
   readability item from the optimization section. Naming your own code's
   weaknesses lands better than claiming it's perfect.
5. *"Why did you test through the adaptor with a fake logger instead of
   mocking the simulation?"* — because the seam is injected output, and
   integration through real objects catches wiring bugs; know the term
   "London vs. Detroit school" if they push.

**General strategy:** every Tier 1–2 feature deliberately probes one seam of
this design — validation centralization, the single-robot assumption, enum
arithmetic, silent failures, the logger. Before the interview, re-read the
Gotchas section: each gotcha is the answer key to one of these questions.

## Optimization Opportunities

Honest framing first: every command executes in O(1) time and O(1) space,
there are no loops over data structures anywhere, and a human typing into a
CLI will never notice any of this. **Nothing here is worth doing for
performance alone at the current scale** — but each item below is a real
inefficiency in the code, worth knowing about, and several double as clarity
improvements. Ordered roughly by value.

### Worth doing (improves clarity as much as speed)

1. **Replace the enum round-trip in `left`/`right` with modular arithmetic**
   (`orientation.ts:33`, `orientation.ts:57`). The current code does a
   double reverse-mapping lookup — `Orientation[Orientation[ordinal] as keyof
   typeof Orientation]` — which converts number → name → number and allocates
   nothing but is hard to read and easy to break. Since the enum values are
   contiguous 0..3 in clockwise order, both functions collapse to one line:

   ```ts
   const MEMBER_COUNT = 4; // or Object.keys(Orientation).length / 2, computed once

   export const left  = (o: Orientation): Orientation => (o + MEMBER_COUNT - 1) % MEMBER_COUNT;
   export const right = (o: Orientation): Orientation => (o + 1) % MEMBER_COUNT;
   ```

   This also deletes the wrap-around special cases entirely and keeps working
   if you add diagonal directions.

2. **Hoist the member count out of `right()`** (`orientation.ts:53`). Today
   `Object.keys(Orientation).length / 2` runs on *every* right turn —
   building a fresh array of 8 keys just to count them. It's a constant; compute
   it once at module load. (Subsumed by item 1, but if you keep the current
   structure, do at least this.)

3. **Return direction vectors as shared constants instead of fresh objects**
   (`orientation.ts:74-79`). `forwardMovement` allocates a new `{x, y}` object
   per call. A frozen lookup table removes the per-call allocation *and* the
   switch:

   ```ts
   const FORWARD: ReadonlyArray<{ x: number; y: number }> = [
     { x: 0, y: 1 },  // NORTH
     { x: 1, y: 0 },  // EAST
     { x: 0, y: -1 }, // SOUTH
     { x: -1, y: 0 }, // WEST
   ];
   export const forwardMovement = (o: Orientation) => FORWARD[o];
   ```

   Tradeoff: you lose the compiler's exhaustiveness check that the `switch`
   gives you (an array can silently be shorter than the enum), and callers
   must not mutate the shared objects. A `Record<Orientation, ...>` keeps
   exhaustiveness; measure which you value more.

4. **Hoist the PLACE regex to a module constant** (`commandAdaptor.ts:59`).
   Regex literals inside a function are re-evaluated per call (engines cache
   the compilation, but the lookup isn't free, and hoisting is the standard
   idiom anyway). Declare `const PLACE_PATTERN = /^PLACE (\d+),(\d+),(NORTH|EAST|SOUTH|WEST)$/`
   once at module scope — and anchor it while you're there (see Gotchas).

### Only worth it if the input volume becomes large (piped files, network)

5. **Avoid `split(" ")` per line in `processCommand`**
   (`commandAdaptor.ts:34`). Splitting allocates an array (and for PLACE,
   copies of every token) just to read the first word. `const idx =
   line.indexOf(" "); const command = idx === -1 ? line : line.slice(0, idx)`
   does one slice. Matters only if you're streaming millions of commands.

6. **Skip the throwaway object in rejected moves** (`toyRobotSimulation.ts:90-95`).
   `moveRobot` always allocates the candidate position via `inFrontOf`, then
   may discard it. You could bounds-check the delta arithmetic before
   constructing the object — but this trades a tiny allocation for duplicated
   coordinate math. Not recommended unless profiling says so; the
   validate-then-commit shape is worth more than the allocation.

7. **Precompile instead of ts-node for production runs** (`package.json`).
   `npm run start` pays ts-node's TypeScript compilation on every launch
   (hundreds of ms). For repeated or scripted runs, build once to `dist/` and
   run `node dist/index.js` (see "Building for distribution"). This is the
   only item on this list a user could actually perceive.

### Future-proofing (relevant only after extensions)

8. **Obstacles: use a `Set` keyed by `"x,y"`, not an array.** If you add
   obstacles per the recipe above, an array + `some()` scan makes every
   move/place O(#obstacles); a `Set<string>` lookup keeps it O(1). Decide
   this at introduction time — it's a one-line difference then, a refactor
   later.

9. **Command dispatch scale:** the `switch` and a `Record` registry are both
   effectively O(1); don't switch dispatch strategies for speed (do it for
   the extensibility reasons in the design section).

### Non-issues (things that look like optimization targets but aren't)

- **The spread copies in `turnRobotLeft/Right`** — one tiny object per turn
  is the cost of the immutable-update style; keep it.
- **Memory:** the entire simulation state is one 3-field object; there is
  nothing to pool, cache, or lazy-load.
- **Readline:** already streams line-by-line; piping a huge file in will not
  buffer it all in memory.

If you ever do optimize, add a benchmark first (even a crude
`console.time` over a million generated commands) — every item above except
#7 is invisible without one.

### Testing conventions to follow

- Unit tests live next to the code (`src/*.test.ts`), named after the module.
- Simulation tests drive the class API directly and assert via `getRobot()`.
- Integration tests go through `processCommand` with an injected
  string-accumulating logger and compare full output — copy
  `runAndCompareOutput` from `commandAdaptor.test.ts`.
- There are no mocking libraries in use and none are needed; the injected
  logger is the only seam.
- Before pushing: `npm test` and `npx tsc --noEmit` (type-check isn't part of
  the test run — ts-jest will surface type errors in test files, but a
  standalone `tsc` pass is the reliable check).
