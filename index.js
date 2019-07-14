const brain = require("brain.js"),
  { promisify } = require("util"),
  fs = require("fs"),
  readline = require('readline-sync'),
  path = require('path'),
  afs = {
    readFile: promisify(fs.readFile),
    writeFile: promisify(fs.writeFile),
    exists: promisify(fs.exists),
    delete: promisify(fs.unlink),
  },
  options = {
    dataFile: path.join(__dirname, "data/data.csv")
  };

class GameState {
  constructor (data = Array(42).fill(0.5)) {
    data = data.map(point => {
      try {
        return parseFloat(data);
      } catch(e) {
        throw new Error("Invalid Game State");
      }
    })
    this.state = data;
    this.lastPlayer = 1;
    this.moves = [];
  }

  play (column, player) {
    if(this.lastPlayer === player) throw new Error(`Player ${player}, it isn't your turn...`);
    if(column > 6) throw new Error("Invalid Move");
    const state = this.state.map(i => i) //get state by value
    let rows = [];
      
    for(let row = 0; row < 7; row++){
        const point = row*6+column;
        rows.push(state[point]);
    }
    
    const row = rows.indexOf(0.5);
    if(row === -1) throw new Error("Invalid Move");
    this.lastPlayer = player;
    console.log(`Accepted player ${player}'s move`);

    this.state[row*6+column] = player;
    this.moves.push(column);
  }

  get visualGrid() {
    const state = this.state.map(i => i) //get state by value
    const tokens = { 0: "🔴", 0.5: "⚫", 1: "🔵"};
  
    let output = [];
    for(let y = 0; y < 7; y++){
      output.push(
        state.splice(0,6)
      );
    }
    
    return output.reverse().map(row => row.map(item => tokens[item])
    .join("")).join("\n");
  }

  get verticalWin() { //ToDo: Fix this function as it currently counts as a win with only 3
    let columns = [[],[],[],[],[],[]];
    const state = this.state.map(i => i) //get state by value

    for(let y = 0; y < 7; y++){
      let row = state.splice(0,6);
      for(let i = 0; i < 6; i++){
        columns[i].push(row[i]);
      }
    }
    columns = columns.map(column => column.join(","));
    for(let column of columns){
      if(column.includes("0,0,0,0,") || column.endsWith("0,0,0,0")) return 0;
      if(column.includes("1,1,1,1,") || column.endsWith("1,1,1,1")) return 1;
    }

    return false;
  }

  get horizontalWin() {
    const state = this.state.map(i => i);
    const rows = [];
    for(let y = 0; y < 7; y++){
      rows.push(
        state.splice(0,6)
      );
    }

    for(let row of rows.map(row => row.join(","))){
      if(row.includes("0,0,0,0,") || row.endsWith("0,0,0,0")) return 0;
      if(row.includes("1,1,1,1,") || row.endsWith("1,1,1,1")) return 1;
    }

    return false;
  }

  get diagonalWin() {
    const startingPoints = [
      [0,6],
      [0,5],
      [0,4],
      [0,3],
      [0,2],
      [0,1],
      [0,0],[1,0],[2,0],[3,0],[4,0],[5,0]
    ];
    for(const startingPoint of startingPoints){
      const max = startingPoint[0] > 0 ? 6-startingPoint[0] : 7-startingPoint[1];
      const line = [];
      for(let i = 0; i < max; i++){
        const row = startingPoint[1]+i,
          column = startingPoint[0]+i;
        line.push(this.state[row*6+column]);
      }
      if(line.includes("0,0,0,0,") || line.endsWith("0,0,0,0")) return 0;
      if(line.includes("1,1,1,1,") || line.endsWith("1,1,1,1")) return 1;
    }
    return false;
  }

  get win() {
    if(typeof this.verticalWin === "number") {
      return {
        winner: this.verticalWin,
        type: "vertical"
      }
    }

    if(typeof this.horizontalWin === "number") {
      return {
        winner: this.horizontalWin,
        type: "horizontal"
      }
    }

    if(typeof this.diagonalWin === "number") {
      return {
        winner: this.diagonalWin,
        type: "diagonal"
      }
    }

    return false
  }
}

class Mind {
  constructor(){
    console.log("Creating new mind instance");
    this.mind = new brain.recurrent.LSTM()
    this.trainingData = [];
  }

  async loadTrainingData(){
    try{
      let data = await afs.readFile(options.dataFile,"utf8");
      data = data.split("\n");
      data.map(line => line.split(",").map(num => parseInt(num)));
      this.trainingData = data;
    } catch(e) {
      console.error("Failed to read training data",e);
      process.exit(1);
    }
  }

  async saveTrainingData(){
    try{
      console.log("Reading Training Data");
      await afs.writeFile(
        options.dataFile,
        this.trainingData.map(
          line => line.join(",")
        ).join("\n"),
        "utf8"
      );
      console.log("Training Data Read");
    } catch(e) {
      console.error("Failed to save training data");
    }
  }

  async train(iterations) {
    try{
      console.log("Training AI before Game");
      this.mind.train(this.trainingData, {
        iterations,    // the maximum times to iterate the training data --> number greater than 0
        errorThresh: 0.005,   // the acceptable error percentage from training data --> number between 0 and 1
        log: false
      });
    } catch(e) {
      console.error("Failed to train with training data",e);
      process.exit(1);
    }
  }

  async nextMove(currentState) {
    const suggestedMoves = this.mind.run(currentState);
    let suggestedMove = suggestedMoves.split(",");
    suggestedMove.shift();
    suggestedMove = parseInt(suggestedMove[0]);
    if(typeof suggestedMove !== "number"){
      console.error("AI Error");
      process.exit(1);
    }
    if(Math.random()*1000 > this.trainingData.length){
      return Math.floor(Math.random() * 6);
    }

    return Math.floor(suggestedMove);
  }
}

const gameLoop = async (mind,game) => {
  if(game.moves.length % 2 == 0 || game.moves.length === 0){
    console.log("Current Game State: \n\n"+game.visualGrid);
    try {
      let playerChoice = parseInt(readline.question("Which Row do you want to play on? ")) -1;
      game.play(playerChoice,0);
      console.log("You played on column "+(playerChoice+1));
    } catch(e) {
      console.error(e);
    }
  }
  if(game.moves.length % 2 == 1 || game.moves.length === 1){
    try {
      const AIChoice = await mind.nextMove(game.moves);
      game.play(AIChoice,1);
      console.log(`The Neural Network decided to play on column ${AIChoice+1}`);
      
    } catch(e) {
      console.error(e);
      process.exit(1);
    }
  }

  if(!game.win){
    await gameLoop(mind,game);
  }else{
    console.log(game.visualGrid);
    if(game.win.winner === 1){
      mind.trainingData.push(moves);
      console.log("AI Won. Saving for future refrence");
      await mind.saveTrainingData();
    }else {
      console.log("You Won via a "+game.win.type+" move");
    }
    await train();
  }
}

const train = async () => {
  const mind = new Mind();
  
  await mind.loadTrainingData();
  await mind.train(3000);

  console.log("starting new game...");
  const game = new GameState();
  await gameLoop(mind,game);
}

train();