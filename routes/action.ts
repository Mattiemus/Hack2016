/// <reference path='../typings/tsd.d.ts' />

var mongodb = require('mongodb');

import express = require('express');
var router = express.Router();

/* GET get. */
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

/* POST insert. */
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
            error: (err != null),
            reason: (err != null) ? err : undefined,
            result: (err == null) ? result : undefined
        });
    });
});

/* POST delete. */
router.post('/delete/location', function(req, res, next) {
    if(!req.body.id || req.body.id.length == 0) {
        throw new Error('A id must be specified');
    }

    req.db.collection('locations').deleteOne({ "_id": new mongodb.ObjectID(req.body.id) }, (err, result) => {
        res.send({
            error: (err != null),
            reason: (err != null) ? err : undefined,
            result: (err == null) ? result : undefined
        });
    });
});

export = router;
