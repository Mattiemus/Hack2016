/// <reference path='../typings/tsd.d.ts' />

var mongodb = require('mongodb');
var url = require('url');

import express = require('express');
var router = express.Router();

// Creates the routings for CRUD (create, read, update, delete) of a specific collection of
// fields
function createRouter(collectionName, fields) {
    /* POST - Create */
    router.post('/insert/' + collectionName, function(req, res, next) {
        // Error if one of the required fields isnt set
        for(var fieldName in fields) {
            if(!req.body[fieldName] || req.body[fieldName].length == 0) {
                if (fields[fieldName].isArray) {
                    req.body[fieldName] = '';
                } else {
                    res.send({
                        error: true,
                        reason: 'The field "' + fieldName + '" must be specified'
                    });
                    return;
                }
            }

            if(fields[fieldName].isArray) {
                req.body[fieldName] = req.body[fieldName].split(';').filter((n) => { return n != undefined && n.length != 0; });
                if(fields[fieldName].refToo) {
                    for(var i = 0; i < req.body[fieldName].length; i++) {
                        req.body[fieldName][i] = new mongodb.DBRef(fields[fieldName].refToo,
                            new mongodb.ObjectId(req.body[fieldName][i]));
                    }
                }
            } else if(fields[fieldName].refToo) {
                req.body[fieldName] = new mongodb.DBRef(fields[fieldName].refToo,
                  new mongodb.ObjectId(req.body[fieldName]));
            }
        }

        // Perform the query
        req.db.collection(collectionName).insertOne(req.body, (err, result) => {
            res.send({
                error: (err != null),
                reason: (err != null) ? err : undefined,
                result: (err == null) ? result : undefined
            });
        });
    });

    /* GET - Count */
    router.get('/count/' + collectionName, function(req, res, next) {
        // Build a query from the request
        var query = url.parse(req.url, true).query;
        for (var fieldName in query) {
            if(fieldName.endsWith('id')) {
                query[fieldName] = new mongodb.ObjectId(query[fieldName]);
            }
        }

        // Build a cursor
        var cursor = (query == {}) ? req.db.collection(collectionName).find() : req.db.collection(collectionName).find(query);

        // Ask how many employees there are
        cursor.count((err, result) => {
            if (err != null) {
                // An error occured
                res.send({
                    error: true,
                    reason: err
                });
            } else {
                // Return result
                res.send({
                    error: false,
                    result: result
                });
            }
        });
    });

    /* GET - Read */
    router.get('/get/' + collectionName, function(req, res, next) {
        // Build a query from the request
        var query = url.parse(req.url, true).query;
        for (var fieldName in query) {
            if(fieldName.endsWith('id')) {
                query[fieldName] = new mongodb.ObjectId(query[fieldName]);
            }
        }

        // Get everything that satisfies the request
        var cursor = (query == {}) ? req.db.collection(collectionName).find() : req.db.collection(collectionName).find(query);
        var result = [];
        var recordsGrabbingRefs = 0;
        var hasSentOff = false;

        // Iterate over each result
        cursor.each((err, doc) => {
            if (err != null) {
                // An error occured
                res.send({
                    error: true,
                    reason: err
                });
            } else {
                if (doc != null) {
                    // Add the resulting document
                    result.push(doc);

                    // Grab references
                    for(var fieldName in fields) {
                        if(fields[fieldName].refToo) {
                            if(fields[fieldName].isArray) {
                                for (var i = 0; i < doc[fieldName].length; i++) {
                                    // Query for the referenced field
                                    recordsGrabbingRefs++;
                                    ((fieldNameCpy, iCpy, myCursor) => {
                                        myCursor.each((err, refDoc) => {
                                            // Set the referenced value
                                            if(err == null && refDoc != null) {
                                                doc[fieldNameCpy][iCpy] = refDoc;
                                                recordsGrabbingRefs--;
                                            }
                                            if(err != null) {
                                                recordsGrabbingRefs--;
                                            }

                                            // If we have all the fields, send the response!
                                            if (!hasSentOff && recordsGrabbingRefs == 0) {
                                                  hasSentOff = true;
                                                  res.send({
                                                      error: false,
                                                      result: result
                                                  });
                                            }
                                        });
                                    })(fieldName, i, req.db.collection(fields[fieldName].refToo).find({ _id: mongodb.ObjectId(doc[fieldName][i].oid) }));
                                }
                            } else {
                                // Query for the referenced field
                                recordsGrabbingRefs++;
                                ((fieldNameCpy, myCursor) => {
                                    myCursor.each((err, refDoc) => {
                                        // Set the referenced value
                                        if(err == null && refDoc != null) {
                                            doc[fieldNameCpy] = refDoc;
                                            recordsGrabbingRefs--;
                                        }
                                        if(err != null) {
                                            recordsGrabbingRefs--;
                                        }

                                        // If we have all the fields, send the response!
                                        if (!hasSentOff && recordsGrabbingRefs == 0) {
                                            hasSentOff = true;
                                            res.send({
                                                error: false,
                                                result: result
                                            });
                                        }
                                    });
                                })(fieldName, req.db.collection(fields[fieldName].refToo).find({ _id: mongodb.ObjectId(doc[fieldName].oid) }));
                            }
                        }
                    }
                } else if (recordsGrabbingRefs == 0) {
                    // Last document - send the results
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
        // Make sure we have an id to update
        if(!req.body.id || req.body.id.length == 0) {
            res.send({
                error: true,
                reason: 'An id must be specified'
            });
        }

        // Split up array fields
        for(var fieldName in fields) {
            if(req.body[fieldName] && fields[fieldName].isArray) {
                req.body[fieldName] = req.body[fieldName].split(';').filter((n) => { return n != undefined && n.length != 0; });
                if(fields[fieldName].refToo) {
                    for(var i = 0; i < req.body[fieldName].length; i++) {
                        req.body[fieldName][i] = new mongodb.DBRef(fields[fieldName].refToo,
                            new mongodb.ObjectId(req.body[fieldName][i]));
                    }
                }
            } else if(req.body[fieldName] && fields[fieldName].refToo) {
                req.body[fieldName] = new mongodb.DBRef(fields[fieldName].refToo,
                  new mongodb.ObjectId(req.body[fieldName]));
            }
        }

        // Verify the id
        var id;
        try {
            id = new mongodb.ObjectID(req.body.id);
        } catch(e) {
            res.send({
                error: true,
                reason: e
            });
        }

        // Get all current values
        var cursor = req.db.collection(collectionName).find({ "_id": id });
        var result = [];

        // Iterate over the (single) result
        var updated = false;
        cursor.each((err, doc) => {
            if (err != null) {
                // An error occured
                res.send({
                    error: true,
                    reason: err
                });
            } else {
                if (doc != null) {
                    // Set all fields to their current values so we dont overwrite them
                    for(var fieldName in fields) {
                        if(!req.body[fieldName] || req.body[fieldName].length == 0) {
                            req.body[fieldName] = doc[fieldName];
                        }

                        if(fields[fieldName].refToo) {
                            req.body[fieldName] = new mongodb.DBRef(fields[fieldName].refToo,
                              new mongodb.ObjectId(req.body[fieldName]));
                        }
                    }

                    // Perform the update!
                    req.db.collection(collectionName).updateOne({ "_id": new mongodb.ObjectID(req.body.id) },
                        req.body,
                        null,
                        (err, result) => {
                            // Send the result
                            res.send({
                                error: (err != null),
                                reason: (err != null) ? err : undefined,
                                result: (err == null) ? result : undefined
                            });
                        });
                      updated = true;
                } else if (!updated) {
                    // We couldnt update
                    res.send({
                        error: true,
                        reason: 'Could not find document with the id "' + req.body.id + '"'
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

        // Verify the id
        var id;
        try {
            id = new mongodb.ObjectID(req.body.id);
        } catch(e) {
            res.send({
                error: true,
                reason: e
            });
        }

        // Delete the record
        req.db.collection(collectionName).deleteOne({ "_id": id }, (err, result) => {
            res.send({
                error: (err != null),
                reason: (err != null) ? err : undefined,
                result: (err == null) ? result : undefined
            });
        });
    });
}

// Locations router
createRouter('locations', {
    name: {},
    longitude: {},
    latitude: {},
    phone: {},
    fax: {},
    email: {},
    address: {}
});

// Departments router
createRouter('departments', {
    name: {},
    head: { refToo: 'people' }
});

// Skills router
createRouter('skills', {
    name: {},
    category: {}
});

// People router
createRouter('people', {
    firstname: {},
    lastname: {},
    gender: {},
    phone: {},
    email: {},
    room: {},
    rank: {},
    salary: {},
    reviewDate: {},
    department: { refToo: 'departments' },
    location: { refToo: 'locations' },
    skills: { refToo: 'skills', isArray: true }
    happiness: {},
    workload: {},
    likes: { isArray: true },
    dislikes: { isArray: true }
});

export = router;
