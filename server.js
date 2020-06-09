const express = require('express')
const app = express()

require('dotenv').config();
const PORT = process.env.PORT || 3001;

// remove browser protection to be able to pull data
const cors = require('cors');
app.use(cors());

// constructor function for Location data
function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

// constructor function for weather data
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

// 500 error message
const error = (err, res) => {
  console.log('Error', err);
  res.status(500).send('There was an error on our part.');
}

// location path
app.get('/location', (req, res) => {

  try {
    let searchQuery = req.query.city;
    let jsonData = require('./data/location.json');
    let locationData = new Location(searchQuery, jsonData[0]);

    res.status(200).send(locationData);

  } catch (err) {
    error(err, res);
  }
});

// weather path
app.get('/weather', (req, res) => {

  try {
    let wxArr = [];
    let wxData = require('./data/weather.json');

    wxData.data.forEach(val => {
      wxArr.push(new Weather(val));
    });

    res.status(200).send(wxArr);

  } catch (err) {
    error(err, res);
  }
});

// catch all for unknown routes
app.get('*', (req, res) => {
  res.status(404).send('Sorry, this route does not exist.');
})

// listen on port 3000
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});