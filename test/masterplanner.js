'use strict';

var expect = require('chai').expect;
var MasterPlanner = require('../lib/masterplanner');

describe('MasterPlanner', function () {

  describe('constructor', function () {

    it('sets a city', function () {
      expect(new MasterPlanner('newyork'))
        .to.have.a.property('city', 'newyork');
    });

    it('sets credentials', function () {
      expect(new MasterPlanner('newyork', 'c'))
        .to.have.property('credentials', 'c');
    });

  });

});