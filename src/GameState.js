class GameState {
  /**
   * A Game State Tracking Object for the game of Connect 4
   * @param {[number]} data The Board as a 1D array. Must be 42 items long
   */
  constructor(data = Array(42).fill(0.5)) {
    this.state = data;
    this.lastPlayer = 1;
    this.moves = [];
  }

  /**
   * Plays a given player's token
   * @param {0|1|2|3|4|5} column The Column to play the token on
   * @param {0|1} player The Player who wishes to play a token
   */
  play(column, player) {
    if (player !== 1 && player !== 0) throw new Error("Invalid Player");
    if (!(column > -1 && column < 6)) throw new Error("Invalid Move");
    if (this.lastPlayer === player)
      throw new Error(`Player ${player}, it isn't your turn`);

    const state = this.state.map(i => i); //get state by value
    let rows = [];

    for (let row = 0; row < 7; row++) {
      const point = row * 6 + column;
      rows.push(state[point]);
    }

    const row = rows.indexOf(0.5);
    if (row === -1) throw new Error("Invalid Move");
    this.lastPlayer = player;
    this.state[row * 6 + column] = player;
    this.moves.push(column);
  }

  /**
   * Returns a Visual game board using "🔴" for Player 0,  "🔵" for player 1 and "⚫" for empty spaces
   */
  get visualGrid() {
    const state = this.state.map(i => i); //get state by value
    const tokens = { 0: "🔴", 0.5: "⚫", 1: "🔵" };

    let output = [];
    for (let y = 0; y < 7; y++) {
      output.push(state.splice(0, 6));
    }

    return output
      .reverse()
      .map(row => row.map(item => tokens[item]).join(""))
      .join("\n");
  }

  /**
   * Return the player ID if there is a vertical winner. False if no vertical winner exists
   * @returns {0|1|false} A player ID or false
   */
  get verticalWin() {
    //ToDo: Fix this function as it currently counts as a win with only 3
    let columns = [[], [], [], [], [], []];
    const state = this.state.map(i => i); //get state by value

    for (let y = 0; y < 7; y++) {
      let row = state.splice(0, 6);
      for (let i = 0; i < 6; i++) {
        columns[i].push(row[i]);
      }
    }
    columns = columns.map(column => column.join(","));
    for (let column of columns) {
      if (column.includes("0,0,0,0,") || column.endsWith("0,0,0,0")) return 0;
      if (column.includes("1,1,1,1,") || column.endsWith("1,1,1,1")) return 1;
    }

    return false;
  }

  /**
   * Return the player ID if there is a horizontal winner. False if no horizontal winner exists
   * @returns {0|1|false} A player ID or false
   */
  get horizontalWin() {
    const state = this.state.map(i => i);
    const rows = [];
    for (let y = 0; y < 7; y++) {
      rows.push(state.splice(0, 6));
    }

    for (let row of rows.map(row => row.join(","))) {
      if (row.includes("0,0,0,0,") || row.endsWith("0,0,0,0")) return 0;
      if (row.includes("1,1,1,1,") || row.endsWith("1,1,1,1")) return 1;
    }

    return false;
  }

  /**
   * Return the player ID if there is a diagonal winner. False if no diagonal winner exists
   * @returns {0|1|false} A player ID or false
   */

  get diagonalWin() {
    const lines = [],
      startingPoints = [
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6],
        [5, 6],
        [0, 6],
        [0, 5],
        [0, 4],
        [0, 3],
        [0, 1],
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0]
      ];

    for (const startingPoint of startingPoints) {
      //get up line
      const lineOne = [],
        lineTwo = [],
        x = startingPoint[0],
        y = startingPoint[1];

      for (let i = 0; x + i < 6 && y + i < 7; i++) {
        const row = x + i,
          column = y + i;
        lineOne.push(this.state[row * 6 + column]);
      }

      for (let i = 0; x + i < 6 && y - i > 0; i++) {
        const row = x + i,
          column = y - i;
        lineTwo.push(this.state[row * 6 + column]);
      }
      if (lineOne.length > 4) lines.push(lineOne.join(","));
      if (lineTwo.length > 4) lines.push(lineTwo.join(","));
    }

    for (const line of lines) {
      if (line.includes("0,0,0,0,") || line.endsWith("0,0,0,0")) return 0;
      if (line.includes("1,1,1,1,") || line.endsWith("1,1,1,1")) return 1;
    }
  }
  /**
   * @typedef winningObject A Winner Object
   * @property {"vertical"|"horizontal"|"diagonal"} type The direction of the 4 tokens for the win
   * @property {1|0} winner The player that won
   */
  /**
   *
   * @returns {winningObject|false}
   */
  get win() {
    if (typeof this.verticalWin === "number") {
      return {
        winner: this.verticalWin,
        type: "vertical"
      };
    }

    if (typeof this.horizontalWin === "number") {
      return {
        winner: this.horizontalWin,
        type: "horizontal"
      };
    }

    if (typeof this.diagonalWin === "number") {
      return {
        winner: this.diagonalWin,
        type: "diagonal"
      };
    }

    return false;
  }
}

module.exports = GameState;
