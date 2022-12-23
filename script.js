const Player = function(name, avatar) {
  let _winCounter = 0;
  const addWin = () => ++_winCounter;
  const getWins = () => _winCounter;
  return {
    name,
    avatar,
    marker: '',
    color: '',
    addWin,
    getWins,
  }
}

const gameController = (function () {
  const _gameParameters = {
    columns: 3,
    rows: 3,
    winningStreak: 3,
    turnTimer: 10000,
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
        squareInstance.addEventListener('click', _endTurn, {once: true});
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
    _assignRandomColors();
    activePlayer = currentPlayers[Math.floor(Math.random() * 2)];
    displayController.displayPreGameScreen();
    setTimeout(() => {
      displayController.displayGameScreen(_gameParameters.turnTimer);
      _startNewTurn();
    }, 5000);
  }

  const _startNewTurn = () => {
    _turnCounter++;
    displayController.displayNewTurn(activePlayer, _turnCounter);
    _turnTimerID = _startTurnTimer();
  }

  const _endTurn = (event) => {
    _stopTurnTimer();
    displayController.stopTurnTimer();
    event.target.dataset.marker = activePlayer.marker;
    const markerImage = displayController.markers[activePlayer.marker].cloneNode(true);
    markerImage.classList.add(`player-color-${activePlayer.color}`);
    event.target.appendChild(markerImage);
    event.target.classList.remove('active');
    if (_isWinner()) {
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
      displayController.displayTurnTimer(_gameParameters.turnTimer);
      return setTimeout(_failPlayerTimeout, _gameParameters.turnTimer);
    }
  }

  const _stopTurnTimer = () => {
    clearTimeout(_turnTimerID);
  }

  const _endGame = () => {
    alert(activePlayer.name + 'wins!')
    activePlayer.addWin();
    displayController.displayWinner(activePlayer);
    activePlayer = null;
    _gameBoard = [];
    currentPlayers.forEach(player => {
      player.marker = '';
      player.color = '';
    });
  }

  const _isWinner = () => {
    const _checkHorizontal = () => {
      for (let row = 0; row < _gameBoard.length; row++) {
        let currentStreak = 0;
        let previousMarker = _gameBoard[row][0];
        _gameBoard[row].forEach(square => {
          if (square.dataset.marker == previousMarker && previousMarker != '') {
            currentStreak++;
            if (currentStreak == _gameParameters.winningStreak) {
              return true;
            }   
          } else {
            currentStreak = 1;
            previousMarker = square.dataset.marker;
          }
        })
      }
      return false;
    }

    const _checkVertical = () => {
      for (let column = 0; column < _gameBoard[0].length; column++) {
        let currentStreak = 0;
        let previousMarker = _gameBoard[0][column];
        for (let row = 0; row < _gameBoard.length; row++) {
          let square = _gameBoard[row][column];
          if (square.dataset.marker == previousMarker && previousMarker != '') {
            currentStreak++;
            if (currentStreak == _gameParameters.winningStreak) {
              return true;
            }   
          } else {
            currentStreak = 1;
            previousMarker = square.dataset.marker;
          }
        }
      }
      return false;
    }

    const _checkDiagonal = () => {
      for (let row = 0; row < _gameBoard.length; row++) {
        for (let column = 0; column < _gameBoard[row].length; column++) {
          if (_gameBoard[row][column].dataset.marker) {
            let previousMarker = _gameBoard[row][column].dataset.marker;
            let currentStreak = 1;
            let i = 1;
            try {
              while(_gameBoard[row+i][column+i]) {
                if (_gameBoard[row+i][column+i].dataset.marker == previousMarker) {
                  currentStreak++;
                  i++;
                } else {
                  break;
                }
              }}
            catch {}
            if (currentStreak >= _gameParameters.winningStreak) {
              return true;
            }

            currentStreak = 1;
            i = 1;
            try {
              while(_gameBoard[row+i][column-i]) {
                if (_gameBoard[row+i][column-i].dataset.marker == previousMarker) {
                  currentStreak++;
                  i++;
                } else {
                  break;
                }
              }}
            catch {}
            if (currentStreak >= _gameParameters.winningStreak) {
              return true;
            }
          }
        }
      }
    }

    if (_checkHorizontal() || _checkVertical() || _checkDiagonal()) {
      return true;
    } else {
      return false;
    }
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
    currentPlayers[0].marker = availableMarkers.splice(
      Math.floor(Math.random() * 2), 1)[0];
    currentPlayers[1].marker = availableMarkers[0];
  }

  const _assignRandomColors = () => {
    const availableColors = ['a', 'b'];
    currentPlayers[0].color = availableColors.splice(
      Math.floor(Math.random() * availableColors.length), 1)[0];
    currentPlayers[1].color = availableColors.splice(
      Math.floor(Math.random() * availableColors.length), 1)[0];
  }

  return {startGame, addPlayer, currentPlayers};
})();

const displayController = (function() {
  let lastScreen;
  let _gameBoard;
  let _turnTimerID;
  const template = document.querySelector('template').content;
  const menuContainer = document.querySelector('.menu-container');
  const markers = {
    cross: template.querySelector(
      '.marker-cross'),
    circle: template.querySelector(
      '.marker-circle'),
  }

  const displayMainMenu = () => {
    hideLastScreen();
    displayGameTitle();
    const mainMenu = template.getElementById('main-menu').cloneNode(true);
    lastScreen = mainMenu;
    menuContainer.appendChild(mainMenu);
    mainMenu.querySelector('button[name="new-game"]').addEventListener('click',
        displayAddPlayerScreen);
    mainMenu.querySelector('button[name="leaderboard"]').addEventListener('click',
        displayLeaderboard);
  }

  const displayAddPlayerScreen = () => {
    hideLastScreen();
    const addPlayerScreen = template.getElementById('add-player').cloneNode(true);
    lastScreen = addPlayerScreen;
    menuContainer.appendChild(addPlayerScreen);
    addPlayerScreen.querySelector('h1').textContent = `PLAYER ${
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
    const createProfileScreen = template.getElementById('create-profile').cloneNode(true);
    lastScreen = createProfileScreen;
    menuContainer.appendChild(createProfileScreen);
    createProfileScreen.querySelector('h1').textContent = `PLAYER ${
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
        gameController.startGame();
      }
    }
  }

  const displayPreGameScreen = () => {
    hideLastScreen();
    hideGameTitle();
    const preGameScreen = template.getElementById('pre-game').cloneNode(true);
    lastScreen = preGameScreen;
    menuContainer.appendChild(preGameScreen);
    const playerCards = preGameScreen.querySelectorAll('.player-card');
    playerCards.forEach((card, index) => {
      const currentPlayer = gameController.currentPlayers[index];
      card.classList.add(`player-color-${currentPlayer.color}`);
      card.querySelector('img').src = `./assets/${currentPlayer.avatar}.jpg`;
      card.querySelector('.player-marker-background').appendChild(markers[
          currentPlayer.marker].cloneNode(true));
      card.querySelector('.player-name').textContent = currentPlayer.name;
    })
  }

  const displayGameScreen = (turnTimer) => {
    hideLastScreen();
    const gameScreen = template.getElementById('game').cloneNode(true);
    lastScreen = gameScreen;
    menuContainer.appendChild(gameScreen);
    const centerContainer = gameScreen.querySelector('.center-container');
    centerContainer.insertBefore(_gameBoard, centerContainer.querySelector('.turn-timer'));
    gameScreen.querySelectorAll('.player-tab').forEach((tab, index) => {
      const currentPlayer = gameController.currentPlayers[index];
      tab.classList.add(`player-color-${currentPlayer.color}`);
      tab.querySelector('.player-icon > img').src = `./assets/${currentPlayer.avatar}.jpg`;
      tab.querySelector('.player-marker-background').appendChild(markers[
          currentPlayer.marker].cloneNode(true));
      tab.querySelector('.player-name').textContent = currentPlayer.name;
      tab.querySelector('.win-counter').textContent = currentPlayer.getWins();
    })
    if (turnTimer != Infinity) {
      document.getElementById('game').querySelector('.turn-timer').classList.remove('hidden');
    }
  }

  const displayNewTurn = (currentPlayer, turnNumber) => {
    const gameScreen = document.getElementById('game');
    document.getElementById('turn-counter').textContent = `TURN: ${turnNumber}`;
    const card = gameScreen.querySelector('.current-player .player-card');
    card.classList = `player-card player-color-${currentPlayer.color}`;
    card.querySelector('img').src = `./assets/${currentPlayer.avatar}.jpg`;
    const markerBackground = card.querySelector('.player-marker-background');
    if (markerBackground.lastElementChild) {
    markerBackground.removeChild(markerBackground.lastElementChild);
    };
    markerBackground.appendChild(markers[currentPlayer.marker].cloneNode(true));
    card.querySelector('.player-name').textContent = currentPlayer.name;
  }
  
  const displayTurnTimer = (turnTimer) => {
    const timerBar = document.getElementById('game').querySelector('.timer-bar');
    timerBar.style.cssText = '';
    let timeLeft = turnTimer;
    const interval = 10;
    let percentageLeft;
    const timerStart = Date.now();
    setTimeout(() => {
      timerBar.style.borderRadius = '15px 7px 7px 15px';
    }, 100);
    _turnTimerID = setInterval(updateTimer, interval);
    function updateTimer() { 
      timeLeft = turnTimer + timerStart - Date.now();
      if (timeLeft <= 0) {
        timerBar.style.width = '0';
        clearInterval(_turnTimerID);
      }
      percentageLeft = timeLeft / turnTimer * 100;
      timerBar.style.width = `${percentageLeft}%`;
      switch(true) {
        case percentageLeft >= 90:
          timerBar.style.backgroundColor = `var(--time-left-90)`;
          break;
        case percentageLeft >= 80:
          timerBar.style.backgroundColor = `var(--time-left-80)`;
          break;
        case percentageLeft >= 70:
          timerBar.style.backgroundColor = `var(--time-left-70)`;
          break;
        case percentageLeft >= 60:
          timerBar.style.backgroundColor = `var(--time-left-60)`;
          break;
        case percentageLeft >= 50:
          timerBar.style.backgroundColor = `var(--time-left-50)`;
          break;
        case percentageLeft >= 40:
          timerBar.style.backgroundColor = `var(--time-left-40)`;
          break;
        case percentageLeft >= 30:
          timerBar.style.backgroundColor = `var(--time-left-30)`;
          break;
        case percentageLeft >= 20:
          timerBar.style.backgroundColor = `var(--time-left-20)`;
          break;
        case percentageLeft >= 10:
          timerBar.style.backgroundColor = `var(--time-left-10)`;
          break;
      }
    }
  }

  const displayWinner = (player) => {

  }

  const stopTurnTimer = () => {
    clearInterval(_turnTimerID);
  }

  const hideTurnTimer = () => {
    document.getElementById('game').querySelector('.turn-timer').classList.add('.hidden');
  }

  const displayPlayerTimeout = () => {
    // alert('timed out');
  }

  const displayLeaderboard = () => {

  }

  const displayGameTitle = () => {
    menuContainer.appendChild(template.getElementById('game-title').cloneNode(true));
  }

  const hideGameTitle = () => {
    document.getElementById('game-title').remove();
  }

  const hideLastScreen = () => {
    if (lastScreen) {
    lastScreen.remove();
  }
  }

  const addBoard = (boardDiv) => {
    _gameBoard = boardDiv;
  }

  return {displayMainMenu, displayAddPlayerScreen, displayPreGameScreen, displayGameScreen, addBoard, displayNewTurn, displayPlayerTimeout, markers, displayTurnTimer, stopTurnTimer, displayWinner}
})();

displayController.displayMainMenu();

// displayController.displayTurnTimer(5000);