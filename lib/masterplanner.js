'use strict';

var Promise = require('bluebird'),
    request = require('request');

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
    .spread(function (response) {
      if (response.body) {
        var message = 'Login failed – ';
        message += response.body === 'Incorrect username or password.' ? 'Invalid credentials' : 'Unexpected response';
        var err = new Error(message);
        err.response = response;
        throw err;
      }
    })
    .return(null);
  }
}

module.exports = MasterPlanner;