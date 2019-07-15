const GameState = require("../../src/GameState"),
  test = require("tape");

const playSeries = (game, moves) => {
  for (const i of moves) {
    game.play(i[0], i[1]);
  }
};

test("Gameplay Basics", async assert => {
  assert.plan(9);

  const game = new GameState();
  assert.deepEquals(
    game.state,
    new Array(42).fill(0.5),
    "Initial State is a 1D array with 42 values of 0.5"
  );

  game.play(0, 0);
  assert.equals(game.state[0], 0, "After a single turn, state is correct");
  assert.throws(() => game.play(0, 0), "A player cannot take 2 turns in a row");

  game.play(0, 1);
  assert.equals(
    game.state[6],
    1,
    "After both players have had a turn, state is correct"
  );

  assert.equals(
    game.lastPlayer,
    1,
    "After both players have had a turn, lastPlayer is correct"
  );

  assert.throws(
    () => game.play(0, "a"),
    '"player" must be a value of either 0 or 1'
  );

  assert.throws(
    () => game.play(-1, 1),
    '"column" must be a value of 0 or above'
  );

  assert.throws(() => game.play(6, 1), '"column" must be a value under 5');

  assert.equals(game.win, false, "A win is not reported when there is no win");

  assert.end();
});

test("Cannot add to a full collumn", async assert => {
  assert.plan(1);
  const game = new GameState();
  playSeries(game, [[0, 0], [0, 1], [0, 0], [0, 1], [0, 0], [0, 1], [0, 0]]);
  assert.throws(() => game.play(0, 1), "Cannot add to a ful collumn");
});

test("Grid, force initial state", async assert => {
  assert.plan(1);
  const game = new GameState(new Array(42).fill(1));
  assert.deepEquals(
    game.state,
    new Array(42).fill(1),
    "Forced Initial State is a 1D array with 42 values of 1"
  );
  assert.end();
});

test("visual grid", async assert => {
  assert.plan(1);
  const expectedOutput =
    "\u26AB\u26AB\u26AB\u26AB\u26AB\u26AB\n\u26AB\u26AB\u26AB\u26AB\u26AB\u26AB\n\u26AB\u26AB\u26AB\u26AB\u26AB\u26AB\n\u26AB\u26AB\u26AB\u26AB\u26AB\u26AB\n\u26AB\u26AB\u26AB\u26AB\u26AB\u26AB\n\uD83D\uDD35\uD83D\uDD35\uD83D\uDD35\u26AB\u26AB\u26AB\n\uD83D\uDD34\uD83D\uDD34\uD83D\uDD34\uD83D\uDD34\u26AB\u26AB";
  const game = new GameState();
  playSeries(game, [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0]]);

  assert.equals(
    game.visualGrid,
    expectedOutput,
    "visualGrid Correctly returns a visual board"
  );

  assert.end();
});

test("Horizontal wins", async assert => {
  assert.plan(2);
  let game = new GameState();
  playSeries(game, [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0]]);

  assert.deepEquals(
    game.win,
    {
      winner: 0,
      type: "horizontal"
    },
    "Recognise horizontal player 0 win"
  );

  game = new GameState();
  playSeries(game, [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 0],
    [2, 1],
    [4, 0],
    [3, 1],
    [4, 0],
    [3, 1]
  ]);

  assert.deepEquals(
    game.win,
    {
      winner: 1,
      type: "horizontal"
    },
    "Recognise horizontal player 1 win"
  );
  assert.end();
});

test("Vertical wins", async assert => {
  assert.plan(2);
  let game = new GameState();
  playSeries(game, [[0, 0], [1, 1], [0, 0], [1, 1], [0, 0], [1, 1], [0, 0]]);

  assert.deepEquals(
    game.win,
    {
      winner: 0,
      type: "vertical"
    },
    "Recognise vertical player 0 win"
  );

  game = new GameState();
  playSeries(game, [
    [0, 0],
    [1, 1],
    [2, 0],
    [1, 1],
    [0, 0],
    [1, 1],
    [0, 0],
    [1, 1]
  ]);

  assert.deepEquals(
    game.win,
    {
      winner: 1,
      type: "vertical"
    },
    "Recognise vertical player 1 win"
  );
  assert.end();
});

test("Diagonal wins", async assert => {
  assert.plan(4);
  let game = new GameState();
  playSeries(game, [
    [0, 0],
    [1, 1],
    [1, 0],
    [2, 1],
    [3, 0],
    [2, 1],
    [2, 0],
    [3, 1],
    [4, 0],
    [3, 1],
    [3, 0]
  ]);

  assert.deepEquals(
    game.win,
    {
      winner: 0,
      type: "diagonal"
    },
    "Recognise diagonal to upper left player 0 win"
  );

  game = new GameState();
  playSeries(game, [
    [5, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 0],
    [3, 1],
    [2, 0],
    [2, 1],
    [3, 0],
    [4, 1],
    [3, 0],
    [3, 1]
  ]);

  assert.deepEquals(
    game.win,
    {
      winner: 1,
      type: "diagonal"
    },
    "Recognise diagonal to upper left player 1 win"
  );

  game = new GameState();
  playSeries(game, [
    [5, 0],
    [4, 1],
    [4, 0],
    [3, 1],
    [2, 0],
    [3, 1],
    [3, 0],
    [2, 1],
    [1, 0],
    [2, 1],
    [2, 0]
  ]);

  assert.deepEquals(
    game.win,
    {
      winner: 0,
      type: "diagonal"
    },
    "Recognise diagonal to upper right player 0 win"
  );
  game = new GameState();
  playSeries(game, [
    [0, 0],
    [5, 1],
    [4, 0],
    [4, 1],
    [3, 0],
    [2, 1],
    [3, 0],
    [3, 1],
    [2, 0],
    [1, 1],
    [2, 0],
    [2, 1]
  ]);

  assert.deepEquals(
    game.win,
    {
      winner: 1,
      type: "diagonal"
    },
    "Recognise diagonal to upper right player 1 win"
  );

  assert.end();
});
