/// <reference path='../typings/tsd.d.ts' />

import express = require('express');
var router = express.Router();

/* GET error. */
router.get('/error', function(req, res, next) {
    throw Error('Testing error system');
});

/* GET edit. */
router.get('/edit', function(req, res, next) {
    res.render('edit');
});

export = router;
