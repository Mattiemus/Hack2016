/// <reference path='../typings/tsd.d.ts' />

import express = require('express');
var router = express.Router();

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
                    { name: 'latitude' }
                ]
            },
            {
                name: 'departments',
                fields: [
                    { name: 'name' }
                ]
            },
            {
                name: 'skills',
                fields: [
                    { name: 'name' },
                    { name: 'category' }
                ]
            },
            {
                name: 'people',
                fields: [
                    { name: 'firstname' },
                    { name: 'lastname' },
                    { name: 'department' },
                    { name: 'location' },
                    { name: 'skills', isArray: true },
                    { name: 'happiness' },
                    { name: 'workload' },
                    { name: 'likes', isArray: true },
                    { name: 'dislikes', isArray: true }
                ]
            }
        ]
    });
});

export = router;
