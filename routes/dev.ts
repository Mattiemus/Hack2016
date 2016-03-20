/// <reference path='../typings/tsd.d.ts' />

import express = require('express');
var router = express.Router();

/* GET error. */
router.get('/matt', function(req, res, next) {
    res.render('matts');
});

/* GET error. */
router.get('/error', function(req, res, next) {
    throw new Error('Testing error system');
});

/* GET edit. */
router.get('/edit', function(req, res, next) {
    res.render('edit', {
        collections: [
            {
                name: 'locations',
                fields: [
                    { name: 'name' },
                    { name: 'longitude' },
                    { name: 'latitude' },
                    { name: 'phone' },
                    { name: 'fax' },
                    { name: 'email' },
                    { name: 'address' }
                ]
            },
            {
                name: 'departments',
                fields: [
                    { name: 'name' },
                    { name: 'head' }
                ]
            },
            {
                name: 'skills',
                fields: [
                    { name: 'name' },
                    { name: 'category' },
                    { name: 'proficiency' }
                ]
            },
            {
                name: 'people',
                fields: [
                    { name: 'firstname' },
                    { name: 'lastname' },
                    { name: 'photoUrl' },
                    { name: 'gender' },
                    { name: 'phone' },
                    { name: 'email' },
                    { name: 'room' },
                    { name: 'rank' },
                    { name: 'salary' },
                    { name: 'reviewDate' },
                    { name: 'department' },
                    { name: 'location' },
                    { name: 'skills', isArray: true },
                    { name: 'happiness', isArray: true },
                    { name: 'workload', isArray: true },
                    { name: 'comments', isArray: true },
                    { name: 'commentDate', isArray: true },
                    { name: 'likes', isArray: true },
                    { name: 'dislikes', isArray: true }
                ]
            }
        ]
    });
});

export = router;
