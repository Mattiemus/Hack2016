/// <reference path='../typings/tsd.d.ts' />

import express = require('express');
var router = express.Router();

/* GET locations. */
router.get('/get/location', function(req, res, next) {
    var cursor = req.db.collection('locations').find();
    var result = [];
    cursor.each((err, doc) => {
        if (err != null) {
            res.send({
                error: true,
                reason: err
            });
        } else {
            if (doc != null) {
                result.push(doc);
            } else {
                res.send({
                    error: false,
                    result: result
                });
            }
        }
      });
});

/* POST locations. */
router.post('/insert/location', function(req, res, next) {
    if(!req.body.name || req.body.name.length == 0) {
        throw new Error('A name must be specified');
    }
    if(!req.body.longitude || req.body.longitude.length == 0) {
        throw new Error('A longitude must be specified');
    }
    if(!req.body.latitude || req.body.latitude.length == 0) {
        throw new Error('A latitude must be specified');
    }

    req.db.collection('locations').insertOne(req.body, (err, result) => {
        res.send({
            error: (err == null),
            reason: (err == null) ? undefined : err,
            result: (err == null) ? result : undefined
        });
    });
});

export = router;
