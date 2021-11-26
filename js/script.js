'use strict';

// Select DOM elements
const weatherForecast = document.querySelector('.weather-forecast');
const time = document.querySelector('.time');
const date = document.querySelector('.date');
const currentRegion = document.querySelector('.current-region');

// API key
const API_KEY = 'a55da39139ac651b32e5cef13ec51ae4';

// Create time
setInterval(function () {
  const today = new Date();
  time.textContent = new Intl.DateTimeFormat(navigator.language, {
    hour: '2-digit',
    minute: 'numeric',
  }).format(today);
}, 1000);

// Create a date
const today = new Date();
const formatDate = new Intl.DateTimeFormat(navigator.language, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(today);

date.textContent = formatDate;

// Function to get the current location
const currentLocation = async function (lat, lng) {
  // 1. Reverse geocoding
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );
  const data = await response.json();

  // 2. Get the current city and country and display to the UI
  const html = `
  <p>You are currently in ${data.city}, ${data.countryName}</p>
  `;

  currentRegion.insertAdjacentHTML('afterbegin', html);
};

// Function to fetch weather data
const getWeatherData = async function (lat, lng) {
  try {
    // 1. Fetch data from an api
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) throw new Error('Something went wrong');

    // 2. Consume the promise
    const data = await response.json();
    const dailyData = data.daily.slice(0, 5);

    // 3. Display the actual data to the UI
    dailyData.forEach(function (result, i) {
      const html = `
          <div class="current-forecast">
            <h3 class="day">${window
              .moment(result.dt * 1000)
              .format('ddd, MMM D')}</h3>
            <div class="temperature flex">             
              <p class="temp">${result.temp.day.toFixed(1)} &#8451;</p>
            </div>
            <div class="humidity flex">
              <p class="humidity-text">Humidity</p>
              <p class="humid">${result.humidity}%</p>
            </div>
            <div class="humidity flex">
              <p class="humidity-text">Wind speed</p>
              <p class="humid">${result.wind_speed.toFixed(1)}</p>
            </div>
            <img
              src="http://openweathermap.org/img/wn/${
                result.weather[0].icon
              }@2x.png"
              alt="weather icon"
            />
            <div class="description flex">
              <p class="describe">${result.weather[0].description}</p>
            </div>
          </div>
      `;

      weatherForecast.insertAdjacentHTML('beforeend', html);
    });
  } catch (err) {
    console.log(`${err.message}`);

    const html = `
          <div class="current-forecast">
            <div class="alert alert-danger">
            ${err.message}. Please check your internet connection
            </div>
          </div>
      `;

    weatherForecast.insertAdjacentHTML('beforeend', html);
  }
};

// Get the current position of the user
navigator.geolocation.getCurrentPosition(
  function (position) {
    // Destructure the position.coords object
    const { latitude, longitude } = position.coords;

    // Call the function with actual parameters
    getWeatherData(latitude, longitude);
    currentLocation(latitude, longitude);
  },
  function () {
    // Display an error when the fetch fails
    alert('Please turn on your location');
  }
);
