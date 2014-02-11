'use strict';

var Promise = require('bluebird'),
    request = require('request'),
    _       = require('lodash'),
    moment  = require('moment');

function MasterPlanner (city, credentials) {
  this.city = city;
  this.credentials = credentials;
  this.cookies = request.jar();
}

MasterPlanner.prototype = {
  login: function (credentials) {
    var endpoint = 'http://masterplanneronline.com/Handlers/Login.ashx?region=' + this.city;
    if (credentials) {
      this.credentials = credentials
    }
    return Promise.promisify(request.post)({
      url: endpoint,
      form: {
        u: this.credentials.email,
        p: this.credentials.password
      },
      jar: this.cookies
    })
    .bind(this)
    .spread(function (response) {
      if (response.body) {
        var message = 'Login failed – ';
        message += response.body === 'Incorrect username or password.' ? 'Invalid credentials' : 'Unexpected response';
        var err = new Error(message);
        err.response = response;
        throw err;
      } else {
        this.authenticated = true;
      }
    })
    .return(null);
  },

  query: function (query) {
    if (!this.authenticated) {
      throw new Error('Authenticate with .login() before making queries');
    }

    var endpoint = 'http://masterplanneronline.com/' + this.city;

    if (query && query.from) {
      query.from = moment(query.from);
    }

    if (query && query.to) {
      query.to = moment(query.to);
    }

    query = _.defaults(query || {}, {
      keywords: '',
      from: moment(),
      to: moment().add('days', 6)
    });

    if (_.isArray(query.keywords)) {
      query.keywords = query.keywords.join(' ');
    }

    return Promise.promisify(request.post)({
      url: endpoint,
      form: {
        '__EVENTTARGET': '',
        '__EVENTARGUMENT': '',
        'ctl00$ddSearchType': -1,
        'ctl00$ddDateRange': 'Custom',
        'ctl00$txtSearch': query.keywords,
        'ctl00$txtDateFrom': query.from.format('l'),
        'ctl00$txtDateTo': query.to.format('l')
      },
      jar: this.cookies
    });
  }
}

module.exports = MasterPlanner;