'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  // Parent of "running" and "cycling" ... take in common parameters
  constructor(coords, dist, duration) {
    this.coords = coords;
    this.dist = dist; // km
    this.duration = duration; // min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.desciption = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, dist, duration, cadence) {
    super(coords, dist, duration);
    this.cadence = cadence;

    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.dist;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, dist, duration, elevationGain) {
    super(coords, dist, duration);
    this.elevationGain = elevationGain;

    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.dist / (this.duration / 60);
    return this.speed;
  }
}

////////////////////////////////////////////////////////////
// Application Class
class App {
  // private fields
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoom = 13;

  constructor() {
    // call function as soons as class is created
    this._getPosition();

    // Get Data from Local Storage
    this._getLocalStorage();

    // add event listener
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevation);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        // Geolocation exists ... load map
        this._loadMap.bind(this),

        function () {
          alert('Failed to get your location');
        }
      );
  }

  _loadMap(pos) {
    // Load Map to Current Location
    const { latitude } = pos.coords;
    const { longitude } = pos.coords;
    console.log(`http://www.google.ca/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    // Regular function call ... this keyword is default to undefined
    this.#map = L.map('map').setView(coords, this.#mapZoom);

    // Can also freely choose theme of the map
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Event Listener Designed by Leaflet
    this.#map.on('click', this._showForm.bind(this));

    // Render Markers AFTER map is loaded
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //prettier-ignore
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevation() {
    // Form changes depending on choice between "running" or "cycling"
    // "closest" selects closest parent
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // Helper functions ...
    // every = only return true if all elements meet requirements
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // 1. Get Data from Form ... common data for both running and cycling
    const type = inputType.value;
    const dist = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // 2-1. If workout is running = create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // data validation
      if (
        !validInputs(dist, duration, cadence) ||
        !allPositive(dist, duration, cadence)
      )
        return alert('Data must be a positive number');

      workout = new Running([lat, lng], dist, duration, cadence);
    }

    // 2-2. If workout is cycling = create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // data validation
      if (
        !validInputs(dist, duration, elevation) ||
        !allPositive(dist, duration)
      )
        return alert('Data must be a positive number');

      workout = new Cycling([lat, lng], dist, duration, elevation);
    }

    // 3. Add the new workout to workouts array
    this.#workouts.push(workout);

    // 4. Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // 5. Render workout on list
    this._renderWorkoutList(workout);

    // 6. Hide form
    this._hideForm();

    // 7. Set Local Storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.desciption}`
      )
      .openPopup();
  }

  _renderWorkoutList(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.desciption}</h2>
        <div class="workout__details">
          <span class="workout__icon"> ${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          } </span>
          <span class="workout__value">${workout.dist}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
      `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
        </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
        </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    // Leaflet Function
    this.#map.setView(workout.coords, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the public interface
    // workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkoutList(work);
    });
  }

  // ? Additional Feature Ideas
  // 1. Edit existing workout
  // 2. Delete workout
  // 3. Delete ALL workouts
  // 4. SORT workouts by certain field
  // 5. RE-BUILD "Running" and "Cycling" objects fetched from local storage
  // 6. More realistic error and confirmation message
  // 7. show ALL workouts regarless of location [DIFFICULT]
  // 8. draw lines and shapes instead of just points [DIFFICULT]
  // 9. Geocode location from coordinates [ASYNC]
  // 10. Display weather for time and place [ASYNC]

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

// initialize app
const app = new App();
