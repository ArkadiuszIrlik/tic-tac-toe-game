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
  const _gameParameters = {
    columns: 3,
    rows: 3,
    winningStreak: 3,
    turnTimer: 5000,
  }

  let _gameBoard;
  let currentPlayers = [];
  let activePlayer;
  let _turnCounter = 0;
  let _turnTimerID;

  const _createBoardSquare = () => {
    const emptySquare = document.createElement('div');
    emptySquare.dataset.marker = '';
    emptySquare.classList.add('board-square', 'active');
    emptySquare.addEventListener('click', _endTurn);
    return emptySquare;
  }

  const _createBoard = (parameters) => {
    const emptySquare = _createBoardSquare();
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
    _gameBoard = _createBoard(_gameParameters);
    _assignRandomMarkers();
    activePlayer = currentPlayers[Math.floor(Math.random() * 2)];
    _startNewTurn();
  }

  const _startNewTurn = () => {
    _turnCounter++;
    displayController.displayNewTurn(activePlayer, _turnCounter);
    _turnTimerID = _startTurnTimer();
  }

  const _endTurn = (event) => {
    _stopTurnTimer();
    event.target.dataset.marker = activePlayer.marker;
    event.target.classList.remove('active');
    if (isWinner()) {
      _endGame();
    } else {
      _changeActivePlayer();
      _startNewTurn();
    }
  }

  const _changeActivePlayer = () => {
    activePlayer = (activePlayer == currentPlayers[0]) ? 
        currentPlayers[1] : currentPlayers[0];
  }

  const _startTurnTimer = () => {
    if (_gameParameters.turnTimer == Infinity) {
      return null;
    } else {
    setTimeout(_failPlayerTimeout, _gameParameters.turnTimer);
    }
  }

  const _stopTurnTimer = () => {
    clearTimeout(_turnTimerID);
  }

  const _endGame = () => {
    activePlayer.addWin();
    displayController.displayWinner(activePlayer);
    activePlayer = null;
    _gameBoard = [];
    currentPlayer.forEach(player => player.dataset.marker = '');
  }

  const addPlayer = (player) => {
    currentPlayers.push(player);
  }

  const _failPlayerTimeout = () => {
    displayController.displayPlayerTimeout();
    _changeActivePlayer();
    _endGame();
  }

  const _assignRandomMarkers = () => {
    const availableMarkers = ['cross', 'circle'];
    currentPlayers[0].dataset.marker = availableMarkers.splice(
      Math.floor(Math.random() * 2), 1)[0];
    currentPlayers[1].dataset.marker = availableMarkers[0];
  }

})();
