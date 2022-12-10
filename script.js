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
