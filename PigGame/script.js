'use strict';

// Game Rule
/**
 * 1. First player to reach 100 point wins.
 * 2. If a player roles 1, active player loses current Score, other player gets the turn.
 */

// Use hash to select "id" -- or use getElementByID.
const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');

const score0El = document.querySelector('#score--0');
const score1El = document.getElementById('score--1');

const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');

const diceE1 = document.querySelector('.dice');
const btnNew = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');

let scores, currentScore, activePlayer, playing, winnerScore;

// Useful Functions
// Switch to next player
const switchPlayer = function () {
  document.getElementById(`current--${activePlayer}`).textContent = 0;
  currentScore = 0;
  activePlayer = activePlayer === 0 ? 1 : 0;

  // HTML Manipulation
  player0El.classList.toggle('player--active');
  player1El.classList.toggle('player--active');
};

// initial status of the game
const init = function () {
  scores = [0, 0];
  currentScore = 0;
  activePlayer = 0;
  playing = true;
  winnerScore = 100;

  // Initial status.
  score0El.textContent = 0;
  score1El.textContent = 0;
  current0El.textContent = 0;
  current1El.textContent = 0;

  diceE1.classList.add('hidden');
  player0El.classList.remove('player--winner');
  player1El.classList.remove('player--winner');
  player0El.classList.add('player--active');
  player1El.classList.remove('player--active');
};

// initialize game
init();

// Roll Dice Function
btnRoll.addEventListener('click', function () {
  // 1. Generating a random number between 1 - 6.
  // 2. Display the dice.
  // 3. Check for "1".
  // 3-1. If "1", switch to next player.
  if (playing) {
    // Only enable functions when "playing"
    const dice = Math.trunc(Math.random() * 6 + 1);
    diceE1.classList.remove('hidden');
    diceE1.src = `dice-${dice}.png`;

    if (dice !== 1) {
      currentScore += dice;
      document.getElementById(`current--${activePlayer}`).textContent = currentScore;
    } else {
      switchPlayer();
    }
  }
});

// Hold current score function.
btnHold.addEventListener('click', function () {
  // 1. Add current score to active player's score.
  // 2. Check if player's score is >= 100.
  // 2-1. If >= 100, active player wins.
  // 2-2. Else, switch player.

  if (playing) {
    // Only enable functions when "playing"
    scores[activePlayer] += currentScore;
    document.getElementById(`score--${activePlayer}`).textContent = scores[activePlayer];

    if (scores[activePlayer] >= winnerScore) {
      // Stop Game
      playing = false;

      // Winner
      document.querySelector(`.player--${activePlayer}`).classList.add('player--winner');
      document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');
      diceE1.classList.add('hidden');
    } else {
      switchPlayer();
    }
  }
});

btnNew.addEventListener('click', function () {
  // Reset to initial setting of the Game.
  init();
});
