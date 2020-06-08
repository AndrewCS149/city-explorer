const express = require('express')
const app = express()

require('dotenv').config();
const PORT = process.env.PORT;

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(3000)

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
