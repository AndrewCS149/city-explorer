'use strict';

const express = require('express')
const app = express()
const superAgent = require('superagent');
const pg = require('pg');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log(err));

// 500 error message
const error = (err, res) => {
  console.log('Error', err);
  res.status(500).send('There was an error on our part.');
}

// constructor for Location data
function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function locationHandler(req, res) {
  let city = req.query.city;

  // url to the data that we want
  let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

  // check city_explorer DB data
  let citiesQuery = 'SELECT * FROM locations WHERE search_query LIKE ($1);';

  let safeVal = [city];
  client.query(citiesQuery, safeVal)
    .then(results => {
      console.log(safeVal);
      // if the results already exist in DB, then send that data
      if (results.rowCount) {
        res.status(200).send(results.rows[0]);

        // if results dont exist in the DB, grab API data
      } else {
        superAgent.get(url)
          .then(results => {
            let locationObj = new Location(city, results.body[0]);
            let format = locationObj.formatted_query;
            let lat = locationObj.latitude;
            let long = locationObj.longitude;
            res.status(200).send(locationObj);

            let safeValues = [city, format, lat, long];
            let sqlQuery = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';

            client.query(sqlQuery, safeValues)
              .then()
              .catch(err => error(err, res));
          }).catch(err => error(err, res));
      }
    }).catch(err => error(err, res));
}

module.exports.locationHandler = locationHandler;