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
    const boardContainer = document.createElement('div');
    boardContainer.classList.add('board-container');
    const emptySquare = _createBoardSquare();
    const board = [];

    for (let row = 0; row < parameters.rows; row++) {
      board.push([]);
      for (let column = 0; column < parameters.columns; column++) {
        const squareInstance = emptySquare.cloneNode();
        board[row].push(squareInstance);
        boardContainer.appendChild(squareInstance);
      }
    }
    displayController.addBoard(boardContainer);

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

  return {startGame, addPlayer, currentPlayers};
})();

const displayController = (function() {
  let lastScreen;
  const displayMainMenu = () => {
    hideLastScreen();
    displayGameTitle();
    const mainMenu = document.getElementById('main-menu');
    lastScreen = mainMenu;
    mainMenu.classList.toggle('hidden');
    mainMenu.querySelector('button[name="new-game"]').addEventListener('click',
        displayAddPlayerScreen);
    mainMenu.querySelector('button[name="leaderboard"]').addEventListener('click',
        displayLeaderboard);
  }

  const displayAddPlayerScreen = () => {
    hideLastScreen();
    const addPlayerScreen = document.getElementById('add-player');
    lastScreen = addPlayerScreen;
    addPlayerScreen.classList.toggle('hidden');
    addPlayerScreen.querySelector('h3').textContent = `PLAYER ${
      gameController.currentPlayers.length + 1}`;
    addPlayerScreen.querySelector('button[name="log-in"]').addEventListener('click',
        displayLogInScreen);
    addPlayerScreen.querySelector('button[name="create-profile"]').addEventListener('click',
        displayCreateProfileScreen);
  }

  const displayLogInScreen = () => {

  }

  const displayCreateProfileScreen = () => {
    hideLastScreen();
    const createProfileScreen = document.getElementById('create-profile');
    lastScreen = createProfileScreen;
    createProfileScreen.classList.toggle('hidden');
    createProfileScreen.querySelector('h3').textContent = `PLAYER ${
      gameController.currentPlayers.length + 1}`;
    createProfileScreen.querySelector('button[name="finish"]').addEventListener('click',
        createProfile);
  }

  const createProfile = () => {
    const createProfileScreen = document.getElementById('create-profile');
    const usernameInput = createProfileScreen.querySelector('#username-input');
    const avatarSelection = createProfileScreen.querySelector('input[type="radio"]:checked');
    let inputIsValid = true;
    if (usernameInput.value == '') {
      createProfileScreen.querySelector('.missing-name').classList.remove('hidden');
      inputIsValid = false;
    } else {
      createProfileScreen.querySelector('.missing-name').classList.add('hidden');
    }
    if (avatarSelection == null) {
      createProfileScreen.querySelector('.missing-avatar').classList.remove('hidden');
      inputIsValid = false;
    } else {
      createProfileScreen.querySelector('.missing-avatar').classList.add('hidden');
    }
    if (inputIsValid == false) {
      return;
    } else {
      gameController.addPlayer(Player(usernameInput.value, avatarSelection.value));
      usernameInput.value = '';
      avatarSelection.checked = false;
      if (gameController.currentPlayers.length == 1) {
        displayAddPlayerScreen();
      } else {
        displayPreGameScreen();
      }
    }
  }

  const displayLeaderboard = () => {

  }

  const displayGameTitle = () => {
    document.getElementById('game-title').classList.remove('hidden');
  }

  const hideGameTitle = () => {
    document.getElementById('game-title').classList.add('hidden');
  }

  const hideLastScreen = () => {
    if (lastScreen) {
    lastScreen.classList.toggle('hidden');}
  }
  return {displayMainMenu, displayAddPlayerScreen}
})();

displayController.displayMainMenu();