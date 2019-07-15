const Mind = require("./mind"),
  GameState = require("./game-state");

const clear = () => {
  for (let i = 0; i < 10; i++) {
    console.log("\n");
  }
};

const wait = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 300);
  });
};

const gameLoop = async (game, mindOne, mindTwo) => {
  try {
    if (game.lastPlayer === 1) {
      await wait();
      const wantedPlayerOneMove = await mindOne.nextMove(game.moves);
      game.play(
        Math.random() > 0.6
          ? Math.floor(Math.random() * 6)
          : wantedPlayerOneMove,
        0
      );
      clear();
      console.log(game.visualGrid);
    }
    if (game.lastPlayer === 0) {
      await wait();
      game.play(await mindTwo.nextMove(game.moves), 1);
      clear();
      console.log(game.visualGrid);
    }
  } catch (e) {
    console.error(e);
    game.play(Math.floor(Math.random() * 6), game.lastPlayer === 1 ? 0 : 1);
  }
  if (game.win) {
    console.log(game.win);
    if ((game.win.winner = 1)) {
      mindTwo.trainingData.push(game.moves);
      await mindTwo.saveTrainingData();
    }
    game = new GameState();
  }
  await gameLoop(game, mindOne, mindTwo);
};

const init = async () => {
  const mindOne = new Mind();
  await mindOne.loadTrainingData();
  await mindOne.train(700);

  const mindTwo = new Mind();
  await mindTwo.loadTrainingData();
  await mindTwo.train(1000);

  const game = new GameState();
  await gameLoop(game, mindOne, mindTwo);
};

init();
