
const express = require('express')

// use process.env variables to keep private variables,
// be sure to ignore the .env file in github
require('dotenv').config()
// Express Middleware
const helmet = require('helmet') // creates headers that protect from attacks (security)
const bodyParser = require('body-parser') // turns response into usable format
const cors = require('cors')  // allows/disallows cross-site communication
const morgan = require('morgan') // logs requests
const pg = require('pg')
//db Connection w/ localhost
var db = require('knex')({
  client: 'pg',
  // connection: {
  //   host : 'localhost',
  //   port: 5324,
  //   serevr:'postgres',
  //   user : 'postgres',
  //   password : 'postgres',
  //   database : 'bts_demo_1'
  // }
  //client: 'pg',
  connection: 'postgres://postgres:postgres@localhost:5432/bts_demo_1'
});

// Controllers - aka, the db queries
const main = require('./controllers/main')
// App
const app = express()

// App Middleware
const whitelist = ['http://localhost:3000']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(helmet())
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(morgan('combined')) // use 'tiny' or 'combined'

// App Routes - Auth
app.post('/typeLedger', (req, res) => main.postTypeLedger(req, res,db))
app.get('/getAcctName/:userAcct', (req, res) => main.getAcctName(req, res))
app.get('/', (req, res) => res.send('hello world'))


// App Server Connection
app.listen(process.env.PORT || 3002, () => {
  console.log(`app is running on port ${process.env.PORT || 3002}`)
})
