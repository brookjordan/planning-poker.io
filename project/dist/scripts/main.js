const socket = io();
const cardPickerElt      = document.querySelector('#card-picker');
const pickedCardsElt     = document.querySelector('#picked-cards');
const setMainUserElt     = document.querySelector('#claim-main-user');
const displayCardsElt    = document.querySelector('#display-cards');
const resetCardsElt      = document.querySelector('#reset-cards');
const votingForSetterElt = document.querySelector('#voting-for-setter');
const votingForNameElt   = document.querySelector('#voting-for-name');
const votingForTitleElt  = document.querySelector('#voting-for-title');
const name               = localStorage.getItem('Poker user name') || prompt('What is your name?', 'Hello Kitty');


localStorage.setItem('Poker user name', name);
socket.emit('set name', name);


votingForSetterElt.addEventListener('submit', e => { e.preventDefault();
  socket.emit('set voting name', votingForNameElt.value);
})

setMainUserElt.addEventListener('click', e => {
  socket.emit('set main user');
});

displayCardsElt.addEventListener('click', e => {
  socket.emit('display cards');
  displayCardsElt.style.display = 'none';
  resetCardsElt.style.display   = 'inline-block';
});

resetCardsElt.addEventListener('click', e => {
  socket.emit('reset cards');
  displayCardsElt.style.display = 'inline-block';
  resetCardsElt.style.display   = 'none';
});

votingForNameElt.addEventListener('keydown', e => {
  votingForNameElt.classList.add('voting-for-name--changed');
});

socket.on('initialise cards', ({ data, meta }) => {
  setVotingName(data.votingName);
  updatePickableCards(data.valueOptions);
});

socket.on('reset cards', () => {
  votingForNameElt.classList.add('voting-for-name--changed');
  setCard();
});

socket.on('new voting name', newVotingName => {
  setVotingName(newVotingName);
});

socket.on('set main user', ({ data, meta }) => {
  cardPickerElt.style.display = 'none';
  setMainUserElt.style.display = 'none';
  displayCardsElt.style.display = 'inline-block';
  votingForSetterElt.style.display = 'block';
  votingForTitleElt.style.display = 'none';
  updatePicked(data.pickedValues);
  socket.on('new picked cards', ({ data, meta }) => {
    updatePicked(data.pickedValues);
  });
});

socket.on('cannot set main user', mainUserID => {
  setMainUserElt.innerHTML = `Main user is currently: ${mainUserID}`;
});

function setVotingName(newVotingName) {
  votingForTitleElt.innerHTML = newVotingName;
  votingForNameElt.value = newVotingName;
  votingForNameElt.classList.remove('voting-for-name--changed');
}

function updatePicked(values) {
  pickedCardsElt.innerHTML = '';
  values.forEach(value => {
    const liElt = document.createElement('li');

    liElt.className = `picked-cards__card picked-cards__card--${value}`;
    liElt.innerHTML = value;
    liElt.setAttribute('data-value', value);
    pickedCardsElt.appendChild(liElt);
  });
}

function updatePickableCards(values) {
  cardPickerElt.innerHTML = '';
  values.forEach(value => {
    const buttonElt = document.createElement('button');

    buttonElt.className = `card-picker__card card-picker__card--${value}`;
    buttonElt.innerHTML = value;
    buttonElt.setAttribute('data-value', value);
    buttonElt.addEventListener('click', e => {
      setCard(buttonElt);
    });
    cardPickerElt.appendChild(buttonElt);
  });
}

function setCard(cardElt) {
  const cardElts = document.querySelectorAll('.card-picker__card');
  cardElts.forEach(cardElt => {
    cardElt.classList.remove('card-picker__card--active');
  });

  if (cardElt) {
    cardElt.classList.add('card-picker__card--active');
    socket.emit('pick card', cardElt.getAttribute('data-value'));
  }
}
