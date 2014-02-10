'use strict';

var chai            = require('chai'),
    mochaAsPromised = require('mocha-as-promised');

chai.use(require('chai-as-promised'));
mochaAsPromised();