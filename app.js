var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const middlewares = require('./middlewares')

// on importe pour le sync
const Task = require('./models/task')
const User = require('./models/user')

let indexRouter = require('./routes/index');
let tasksRouter = require('./routes/tasks');
let tasksRouter2 = require('./routes/tasks2');
let usersRouter = require('./routes/users');
let usersRouter2 = require('./routes/users2');

var app = express();

// mise en place de middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// s'execute à tout route
// app.use(middlewares.testMiddleware)

// middleware pour traiter les routes
app.use('/', indexRouter);
app.use('/tasks', tasksRouter);
app.use('/tasks2', tasksRouter2);
app.use('/users', usersRouter);
app.use('/users2', usersRouter2);

module.exports = app;
