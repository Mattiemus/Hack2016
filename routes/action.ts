/// <reference path='../typings/tsd.d.ts' />

var mongodb = require('mongodb');

import express = require('express');
var router = express.Router();

function createRouter(collectionName) {
    /* POST - Create */
    router.post('/insert/' + collectionName, function(req, res, next) {
        if(!req.body.name || req.body.name.length == 0) {
            res.send({
                error: true,
                reason: 'An name must be specified'
            });
        }
        if(!req.body.longitude || req.body.longitude.length == 0) {
            res.send({
                error: true,
                reason: 'An longitude must be specified'
            });
        }
        if(!req.body.latitude || req.body.latitude.length == 0) {
            res.send({
                error: true,
                reason: 'An latitude must be specified'
            });
        }

        req.db.collection(collectionName).insertOne(req.body, (err, result) => {
            res.send({
                error: (err != null),
                reason: (err != null) ? err : undefined,
                result: (err == null) ? result : undefined
            });
        });
    });

    /* GET - Read */
    router.get('/get/' + collectionName, function(req, res, next) {
        var cursor = req.db.collection(collectionName).find();
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

    /* POST - Update */
    router.post('/update/' + collectionName, function(req, res, next) {
        if(!req.body.id || req.body.id.length == 0) {
            res.send({
                error: true,
                reason: 'An id must be specified'
            });
        }

        var cursor = req.db.collection(collectionName).find({ "_id": new mongodb.ObjectID(req.body.id) });
        var result = [];
        cursor.each((err, doc) => {
            if (err != null) {
                res.send({
                    error: true,
                    reason: err
                });
            } else {
                if (doc != null) {
                    if(!req.body.name || req.body.name.length == 0) {
                        req.body.name = doc.name;
                    }
                    if(!req.body.longitude || req.body.longitude.length == 0) {
                        req.body.longitude = doc.longitude;
                    }
                    if(!req.body.latitude || req.body.latitude.length == 0) {
                        req.body.latitude = doc.latitude;
                    }

                    req.db.collection(collectionName).updateOne({ "_id": new mongodb.ObjectID(req.body.id) },
                        req.body,
                        null,
                        (err, result) => {
                            res.send({
                                error: (err != null),
                                reason: (err != null) ? err : undefined,
                                result: (err == null) ? result : undefined
                            });
                        });
                }
            }
          });
    });

    /* POST - Delete */
    router.post('/delete/' + collectionName, function(req, res, next) {
        if(!req.body.id || req.body.id.length == 0) {
            res.send({
                error: true,
                reason: 'An id must be specified'
            });
        }

        req.db.collection(collectionName).deleteOne({ "_id": new mongodb.ObjectID(req.body.id) }, (err, result) => {
            res.send({
                error: (err != null),
                reason: (err != null) ? err : undefined,
                result: (err == null) ? result : undefined
            });
        });
    });
}

createRouter('locations');

export = router;
