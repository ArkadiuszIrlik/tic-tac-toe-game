const Player = function(name, avatar) {
  let _winCounter = 0;
  const addWin = () => ++_winCounter;
  const getWins = () => _winCounter;
  return {
    name,
    avatar,
    marker: '',
    addWin,
    getWins,
  }
}

const gameController = (function () {
  const gameParameters = {
    columns: 3,
    rows: 3,
    winningStreak: 3,
    turnTimer: 5000,
  }

  let gameBoard;
  let currentPlayers = [];
  let activePlayer;
  let turnCounter = 0;
  let turnTimerID;

  const createBoardSquare = () => {
    const emptySquare = document.createElement('div');
    emptySquare.dataset.marker = '';
    emptySquare.classList.add('board-square', 'active');
    emptySquare.addEventListener('click', endTurn);
    return emptySquare;
  }

  const createBoard = (parameters) => {
    const emptySquare = createBoardSquare();
    const board = [];

    for (let row = 0; row < parameters.rows; row++) {
      board.push([]);
      for (let column = 0; column < parameters.columns; column++) {
        const squareInstance = emptySquare.cloneNode();
        board[row].push(squareInstance);
        displayController.addSquare(squareInstance);
      }
    }

    return board;
  }

  const startGame = () => {
    gameBoard = createBoard(gameParameters);
    assignRandomMarkers();
    activePlayer = currentPlayers[Math.floor(Math.random() * 2)];
    startNewTurn();
  }

  const startNewTurn = () => {
    turnCounter++;
    displayController.displayNewTurn(activePlayer, turnCounter);
    turnTimerID = startTurnTimer();
  }

  const endTurn = (event) => {
    stopTurnTimer();
    event.target.dataset.marker = activePlayer.marker;
    event.target.classList.remove('active');
    if (isWinner()) {
      endGame();
    } else {
      changeActivePlayer();
      startNewTurn();
    }
  }

  const changeActivePlayer = () => {
    activePlayer = (activePlayer == currentPlayers[0]) ? 
        currentPlayers[1] : currentPlayers[0];
  }

  const startTurnTimer = () => {
    if (gameParameters.turnTimer == Infinity) {
      return null;
    } else {
    setTimeout(failPlayerTimeout, gameParameters.turnTimer);
    }
  }

  const stopTurnTimer = () => {
    clearTimeout(turnTimerID);
  }

  const endGame = () => {
    activePlayer.addWin();
    displayController.displayWinner(activePlayer);
    activePlayer = null;
    gameBoard = [];
    currentPlayer.forEach(player => player.dataset.marker = '');
  }

  const addPlayer = (player) => {
    currentPlayers.push(player);
  }

  const failPlayerTimeout = () => {
    displayController.displayPlayerTimeout();
    changeActivePlayer();
    endGame();
  }

  const assignRandomMarkers = () => {
    const availableMarkers = ['cross', 'circle'];
    currentPlayers[0].dataset.marker = availableMarkers.splice(
      Math.floor(Math.random() * 2), 1)[0];
    currentPlayers[1].dataset.marker = availableMarkers[0];
  }

})();
