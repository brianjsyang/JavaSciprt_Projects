'use strict';

const account1 = {
  owner: 'Brian Yang',
  movements: [
    20000, 45500.23, -30600.5, 2500000, -64200.21, -13300.9, 7900.97, 130000,
  ],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2021-09-19T23:36:17.929Z',
    '2021-09-21T10:51:36.790Z',
  ],
  currency: 'KRW',
  locale: 'ko-KR', // de-DE
};

const account2 = {
  owner: 'Juliane Yamasaki',
  movements: [50000000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2021-09-20T12:01:20.894Z',
  ],
  currency: 'JPY',
  locale: 'ja-JP',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/**
 * State Variables
 */
let currentAccount;
let currentAccTimer;
let sorted = true;

// Create Username. Username is simply initial of owner's name
const createUsernames = acc => {
  acc.forEach(
    i =>
      (i.username = i.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join(''))
  );
};
createUsernames(accounts);

// Format Dates
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

// Format Numbers
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Log Out Timer
const startLogOutTimer = function () {
  // Set time to 5 min
  // Call to timer every seconds
  // Each call back, print remaining time
  // After expire, log out user
  let time = 200;

  const tick = function () {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let second = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${second}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    time--;
  };

  // Allows to call timer function immediately
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// Higher function
const updateUI = function (acc) {
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
  displayMovements(acc);
};

// Print balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((a, cur) => a + cur, 0);
  labelBalance.textContent = `${formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

// Print summaries
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);

  // Interest only happens when deposit occurs.
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, curr) => acc + curr, 0);

  const loc = acc.locale;
  const cur = acc.currency;

  labelSumIn.textContent = `${formatCurrency(incomes, loc, cur)}`;
  labelSumOut.textContent = `${formatCurrency(out, loc, cur)}`;
  labelSumInterest.textContent = `${formatCurrency(interest, loc, cur)}`;
};

// Receive one array of movement and display
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  // Create a copy for sorting
  const sortMove = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  // Loop through array
  sortMove.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // display dates for each movements
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCurrency(mov, acc.locale, acc.currency);

    // create html string
    const html = `<div class="movements__row">
                    <div class="movements__type movements__type--${type}"> 
                      ${i + 1} ${type}
                    </div>
                    <div class="movements__date"> ${displayDate} </div>
                    <div class="movements__value"> ${formattedMov} </div>
                  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/**
 * ACTIONS
 * 1. LOGIN
 * 2. TRANSFER
 * 3. LOAN
 */
// Event Handlers
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting.
  e.preventDefault();

  // Find the account with matching username.
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  // Check if the PIN is correct ... read currentAccount only if variable exist.
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Login successful ... display UI and welcome message.
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    // Display Current Time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: '2-digit',
      month: 'numeric',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Change HTML view
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Check current timer,
    if (currentAccTimer) clearInterval(currentAccTimer);
    currentAccTimer = startLogOutTimer();

    // Display balance, summay, and movements.
    updateUI(currentAccount);
  }
});

// Transfer Funds between accounts
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  inputTransferAmount.value = inputTransferTo.value = '';

  // Conditions for valid transfer
  if (
    amount > 0 &&
    receiver &&
    currentAccount.balance >= amount &&
    receiver?.username != currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiver.movements.push(amount);

    // Add Transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiver.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }

  // Action detected, reset timer
  clearInterval(currentAccTimer);
  currentAccTimer = startLogOutTimer();
});

// Loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = '';

  // Loan condition ... if one of the deposits is greater than 10% of the requested loan amount
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // It takes time for bank to approve the loan
    setTimeout(function () {
      currentAccount.movements.push(amount);

      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
    }, 2500);
  }

  // Action detected, reset timer
  clearInterval(currentAccTimer);
  currentAccTimer = startLogOutTimer();
});

// Delete User.
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const accDelete = inputCloseUsername.value;
  const pinDelete = +inputClosePin.value;

  if (
    currentAccount.username === accDelete &&
    currentAccount.pin === pinDelete
  ) {
    const index = accounts.findIndex(acc => acc.username === accDelete);

    // Delete Accounts
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

// Sorting
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
