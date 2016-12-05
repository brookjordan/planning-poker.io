const socketsIO      = require('socket.io');
const HTTP           = require('../store/http');
const io             = socketsIO(HTTP);
const connectedUsers = new Set();
const cardValues     = new Set(['?', '1', '2', '3', '5', '8', '13']);
const pickedCards    = new Map();
const userNames      = new Map();

let mainUser     = false;
let displayCards = false;
let votingName   = '';

module.exports = initApp;

function initApp() {
  io.on('connection', initiateConnection);
}

function initiateConnection(socket) {
  const data = {
    votingName: votingName,
    valueOptions: Array.from(cardValues),
    pickedValues: getAllPickedValues(),
  };
  const meta = getMeta();

  console.log(`A user connected: ${socket.conn.id}`);

  connectedUsers.add(socket);

  socket.on('pick card', cardValue => {
    if (!displayCards) {
      setSocketPickedCard(socket, cardValue);
    }
  });
  socket.on('set main user', () => {
    setMainUser(socket);
  });
  socket.on('set name', newName => {
    userNames.set(socket, newName);
  });
  socket.on('disconnect', message => {
    handleSocketDisconnect(socket);
  });

  io.to(socket.id).emit('initialise cards', { data, meta, });
}

function setMainUser(socket) {
  if (!mainUser) {
    const data = {
      pickedValues: getAllPickedValues(),
    };
    const meta = getMeta();
    mainUser = socket;
    pickedCards.delete(socket);
    io.to(socket.id).emit('set main user', { data, meta, });

    socket.on('set voting name', newVotingName => {
      setVotingName(newVotingName);
    });

    socket.on('display cards', () => {
      displayCards = true;
      setSocketPickedCard();
    });

    socket.on('reset cards', () => {
      pickedCards.clear();
      displayCards = false;
      setSocketPickedCard();
      setVotingName('');
      io.emit('reset cards');
    });
  } else {
    io.to(socket.id).emit('cannot set main user', userNames.get(mainUser));
  }
}

function setVotingName(newVotingName) {
  votingName = newVotingName;
  io.emit('new voting name', newVotingName);
}

function handleSocketDisconnect(socket) {
  connectedUsers.delete(socket);
  setSocketPickedCard(socket, null);

  if (socket.id === mainUser.id) {
    mainUser = connectedUsers[0] || false;
  }

  console.log(`A user disconnected: ${socket.conn.id}`);
}

function setSocketPickedCard(socket, cardValue) {
  if (socket) {
    if (socket === mainUser) { return false; } // The main user can't pick cards

    if (cardValue === null) {
      pickedCards.delete(socket);
    } else {
      pickedCards.set(socket, `${userNames.get(socket)}: ${cardValue}`);
    }
  }

  const meta = getMeta();
  const data = {
    pickedValues:    getAllPickedValues(),
    displayedValues: displayCards,
  };

  io.emit('new picked cards', { data, meta, });
}

function getAllPickedValues() {
  const values = Array.from(pickedCards.values());
  return displayCards ? values : values.map(value => value.split(':')[0]);
}

function getMeta() {
  return {
    serverTime: +new Date(),
  };
}
