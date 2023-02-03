// env condition
if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

// for layout
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

// routes
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

const bodyParser = require('body-parser')
const methodOverride = require('method-override')

app.set('view engine', 'ejs')     // ejs is the engine we are using for views
app.set('views', __dirname + '/views') // where all the views are creating
app.set('layout', 'layouts/layout') // layout file for all views
app.use(expressLayouts)
app.use(express.static('public'))  // public files
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(methodOverride('_method'))

// routes use
app.use('/', indexRouter)  // for adding index.js
app.use('/authors', authorRouter) 
app.use('/books', bookRouter)

app.listen(process.env.PORT || 3000) // for setting port number for server

// for connection to db
const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL)

const db = mongoose.connection

db.on('error', error => console.log(error))
db.once('open', () => console.log('Mongoose connected successfully'))

