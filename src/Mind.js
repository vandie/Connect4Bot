const brain = require("brain.js"),
  { promisify } = require("util"),
  fs = require("fs"),
  path = require("path"),
  afs = {
    readFile: promisify(fs.readFile),
    writeFile: promisify(fs.writeFile),
    exists: promisify(fs.exists),
    delete: promisify(fs.unlink)
  },
  options = {
    dataFile: path.join(__dirname, "data/data.csv")
  };

class Mind {
  constructor() {
    console.log("Creating new mind instance");
    this.mind = new brain.recurrent.LSTM();
    this.trainingData = [];
  }

  async loadTrainingData() {
    try {
      let data = await afs.readFile(options.dataFile, "utf8");
      data = data.split("\n");
      data = data.map(line => {
        let splitLine = line.split(",");
        return splitLine.map(num => parseInt(num));
      });
      this.trainingData = data;
    } catch (e) {
      console.error("Failed to read training data", e);
      process.exit(1);
    }
  }

  async saveTrainingData() {
    try {
      console.log("Saving Training Data");
      await afs.writeFile(
        options.dataFile,
        this.trainingData.map(line => line.join(",")).join("\n")
      );
      console.log("Training Data Read");
    } catch (e) {
      console.error("Failed to save training data", e);
    }
  }

  async train(iterations) {
    try {
      console.log("Training AI before Game");
      this.mind.train(this.trainingData, {
        iterations, // the maximum times to iterate the training data --> number greater than 0
        errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
        log: false
      });
    } catch (e) {
      console.error("Failed to train with training data", e);
      process.exit(1);
    }
  }

  async nextMove(currentState) {
    const suggestedMoves = this.mind.run(currentState);
    const suggestedMove = parseInt(suggestedMoves[0]);
    if (Math.random() * 100 > 15) {
      return Math.floor(Math.random() * 6);
    }

    return Math.floor(suggestedMove);
  }
}

module.exports = Mind;
