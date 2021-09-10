'use strict';

const maxScore = 20;

// Generate a Secret Numer between 1 - 20.
let secretNumber = Math.trunc(Math.random() * 20 + 1);
let score = maxScore;
let highScore = 0;

// Make Secret Number Visible
//document.querySelector('.number').textContent = secretNumber;

// Useful function
const textContent = function (className, content) {
  document.querySelector(`.${className}`).textContent = content;
};

// Event Listener ... Play the game
document.querySelector('.check').addEventListener('click', function () {
  // What should happen?
  const guess = Number(document.querySelector('.guess').value);
  console.log(typeof guess);

  // input validator
  if (!guess) {
    textContent('message', '🚫 No Number');
  }
  // Player wins
  else if (guess === secretNumber) {
    textContent('message', '🎉 Correct Number!');
    textContent('number', secretNumber);

    // CSS Manipulation
    document.querySelector('body').style.backgroundColor = '#60b347';
    document.querySelector('.number').style.width = '30rem';

    // high score
    if (score > highScore) {
      highScore = score;
      textContent('highscore', highScore);
    }
  }

  // Guess is wrong
  else if (guess !== secretNumber) {
    if (score > 1) {
      textContent(
        'message',
        guess > secretNumber ? '📈 Too High!' : '📉 Too Low!'
      );
      textContent('score', --score);
    } else {
      textContent('message', '💥 You lose the game');
      textContent('score', --score);
    }
  }
});

// Code Challenge
// Make a functioning "Again" button that resets the game.
document.querySelector('.again').addEventListener('click', function () {
  // Restore the initial score.
  secretNumber = Math.trunc(Math.random() * 20 + 1);
  textContent('guess', '');
  textContent('score', maxScore);

  // restore messages and settings.
  textContent('number', '?');
  textContent('message', 'Start guessing...');

  // restore colors
  document.querySelector('body').style.backgroundColor = '#222';
  document.querySelector('.number').style.width = '15rem';
});
