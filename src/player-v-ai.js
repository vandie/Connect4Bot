const { question } = require("readline-sync"),
  Mind = require("./mind"),
  GameState = require("./game-state");

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
      game.play(Math.floor(Math.random() * 6), 1);
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

    const newgame = new GameState();
    gameLoop(mind, newgame);
  }
};

const train = async () => {
  const mind = new Mind();

  await mind.loadTrainingData();
  await mind.saveTrainingData();
  await mind.train(600);

  console.log("starting new game...");
  const game = new GameState();
  await gameLoop(mind, game);
};

train();
