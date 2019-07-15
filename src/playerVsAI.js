const { question } = require("readline-sync"),
  Mind = require("./Mind"),
  GameState = require("./GameState");

const gameLoop = async (mind, game) => {
  if (game.moves.length % 2 == 0 || game.moves.length === 0) {
    console.log("Current Game State: \n\n" + game.visualGrid);
    try {
      let playerChoice =
        parseInt(question("Which Row do you want to play on? ")) - 1;
      game.play(playerChoice, 0);
      console.log("You played on column " + (playerChoice + 1));
    } catch (e) {
      console.error(e);
    }
  }
  if (game.moves.length % 2 == 1 || game.moves.length === 1) {
    try {
      const AIChoice = await mind.nextMove(game.moves);
      console.log(
        `The Neural Network decided to play on column ${AIChoice + 1}`
      );
      game.play(AIChoice, 1);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  if (!game.win) {
    await gameLoop(mind, game);
  } else {
    console.log(game.visualGrid);
    if (game.win.winner === 1) {
      mind.trainingData.push(game.moves);
      console.log("AI Won. Saving for future refrence");
      await mind.saveTrainingData();
    } else {
      console.log("You Won via a " + game.win.type + " move");
    }
    await train();
  }
};

const train = async () => {
  const mind = new Mind();

  await mind.loadTrainingData();
  await mind.saveTrainingData();
  await mind.train(3000);

  console.log("starting new game...");
  const game = new GameState();
  await gameLoop(mind, game);
};

module.exports = train;
