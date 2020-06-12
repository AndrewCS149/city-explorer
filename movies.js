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

// constructor for movies
function Movie(obj) {
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}

// Movies route
function movieHandler(req, res) {

  let city = req.query.search_query;
  let url = `https://api.themoviedb.org/3/search/movie`;

  let queryParams = {
    api_key: process.env.MOVIE_API_KEY,
    query: city,
    limit: 20
  }

  // pull movie api data
  superAgent.get(url)
    .query(queryParams)
    .then(data => {

      let moviesArr = data.body.results;
      let movies = moviesArr.map(val => new Movie(val));
      res.status(200).send(movies);

    }).catch(err => error(err, res));
}

module.exports.movieHandler = movieHandler;
