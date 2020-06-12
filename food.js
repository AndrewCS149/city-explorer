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

// constructor for yelp
function Yelp(obj) {
  this.name = obj.name;
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;
}

function restaurantHandler(req, res) {

  let city = req.query.search_query;
  let url = `https://api.yelp.com/v3/businesses/search`;

  let queryParams = {
    location: city,
    term: 'restaurants',
    limit: 5
  }

  // pull yelp api data
  superAgent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .query(queryParams)
    .then(data => {

      let yelpArr = data.body.businesses;
      let yelp = yelpArr.map(val => new Yelp(val));
      res.status(200).send(yelp);

    }).catch(err => error(err, res));
}

module.exports.restaurantHandler = restaurantHandler;
