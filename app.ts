/// <reference path='./typings/tsd.d.ts' />

import express = require('express');
import path = require('path');
import favicon = require('serve-favicon');
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');

import routes = require('./routes/index');
import action = require('./routes/action');
import dev = require('./routes/dev');

import hbs = require('express-hbs');

var MongoClient = require('mongodb').MongoClient;

var app = express();

// View engine setup
app.engine('hbs', hbs.express4({
    partialsDir: path.join(__dirname, 'views')
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connect MongoDB
app.use((req, res, next) => {
    MongoClient.connect('mongodb://localhost:27017/personauth', (err, db) => {
        if (db == null) {
            var error = new Error('Could not connect to MongoDB');
            next(error);
        } else {
          (<any>req).db = db;
          next();
        }
    });
});

// Add page routes
app.use('/', routes);
app.use('/action', action);
app.use('/dev', dev);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
   var err = new Error('Not Found');
   err['status'] = 404;
   next(err);
});

// Error handlers
// Development error handler - prints stack trace
if (app.get('env') === 'development') {
   app.use((err: any, req, res, next) => {
       res.status(err['status'] || 500);
       res.render('error', {
           message: err.message,
           error: err
       });
   });
}

// Production error handler - no stack traces
app.use((err: any, req, res, next) => {
   res.status(err.status || 500);
   res.render('error', {
       message: err.message,
       error: {}
   });
});

export = app;
