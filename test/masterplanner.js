'use strict';

var expect        = require('chai').expect,
    sinon         = require('sinon'),
    request       = require('request'),
    moment        = require('moment'),
    MasterPlanner = require('../lib/masterplanner');

describe('MasterPlanner', function () {

  var masterPlanner, post;

  beforeEach(function () {
    masterPlanner = new MasterPlanner('newyork', {
      email: 'email',
      password: 'pass'
    });
  });

  beforeEach(function () {
    post = sinon.stub(request, 'post');
  });

  afterEach(function () {
    post.restore();
  });

  describe('Constructor', function () {

    it('sets a city', function () {
      expect(new MasterPlanner('newyork'))
        .to.have.a.property('city', 'newyork');
    });

    it('sets credentials', function () {
      expect(new MasterPlanner(null, 'c'))
        .to.have.property('credentials', 'c');
    });

    it('opens a cookie jar', function () {
      expect(masterPlanner)
        .to.have.property('cookies')
        .with.property('_jar');
    });

  });

  describe('#login', function () {

    var loginMock = require('./mocks/login');

    it('can override credentials if provided', function () {
      post.yields(null, loginMock.success);
      masterPlanner.login();
      expect(masterPlanner.credentials)
        .to.have.property('email');
      masterPlanner.login('c');
      expect(masterPlanner.credentials)
        .to.equal('c');
    });

    describe('Options', function () {

      it('POSTs to the city endpoint', function () {
        post.yields(null, loginMock.success);
        return masterPlanner.login().finally(function () {
          sinon.assert.calledWith(post, sinon.match.has('url', 'http://masterplanneronline.com/Handlers/Login.ashx?region=' + masterPlanner.city));
        });
      });

      it('uses the credentials', function () {
        post.yields(null, loginMock.success);
        return masterPlanner.login().finally(function () {
          sinon.assert.calledWith(post, sinon.match.has('form', {
            u: masterPlanner.credentials.email,
            p: masterPlanner.credentials.password
          }));
        });
      });

      it('uses the cookie jar', function () {
        post.yields(null, loginMock.success);
        return masterPlanner.login().finally(function () {
          sinon.assert.calledWith(post, sinon.match.has('jar', masterPlanner.cookies));
        });
      });

    });

    describe('Response handling', function () {

      describe('Errors', function () {

        it('rejects on an login error response', function () {
          post.yields(null, loginMock.invalidCredentials);
          return expect(masterPlanner.login())
            .to.be.rejectedWith(/credentials/);
        });

        it('throws on any response body', function () {
          post.yields(null, loginMock.unexpectedResponse);
          return expect(masterPlanner.login())
            .to.be.rejectedWith(/Unexpected/);
        });

      });

      describe('Success', function () {

        beforeEach(function () {
          post.yields(null, loginMock.success);
        });

        it('resolves with null', function () {
          return expect(masterPlanner.login())
            .to.eventually.be.null;
        });

        it('marks the client as authenticated', function () {
          return masterPlanner.login().then(function () {
            expect(masterPlanner).to.have.property('authenticated', true);
          });
        });

      });

    });

  });

  describe('#query', function () {

    beforeEach(function () {
      masterPlanner.authenticated = true;
    });

    it('requires authentication', function () {
      masterPlanner.authenticated = false;
      expect(masterPlanner.query.bind(masterPlanner))
        .to.throw(/Authenticate/);
    });

    it('uses the city endpoint', function () {
      masterPlanner.query();
      sinon.assert.calledWith(post, sinon.match.has('url', 'http://masterplanneronline.com/newyork'));
    });

    describe('Options', function () {

      var form = function (key) {
        return post.lastCall.args[0].form[key];
      };

      var key;

      describe('keywords', function () {

        before(function () {
          key = 'ctl00$txtSearch';
        });

        it('is empty by default', function () {
          masterPlanner.query();
          expect(form(key)).to.equal('');
        });

        it('can set a keywords string', function () {
          masterPlanner.query({
            keywords: 'key value'
          });
          expect(form(key)).to.equal('key value');
        });

        it('can set an array of keywords', function () {
          masterPlanner.query({
            keywords: ['key', 'value', 'array']
          });
          expect(form(key)).to.equal('key value array');
        });

      });

      describe('from', function () {

        before(function () {
          key = 'ctl00$txtDateFrom';
        });

        it('is today by default', function () {
          masterPlanner.query();
          expect(form(key))
            .to.equal(moment().format('l'));
        });

        it('can be set to another date', function () {
          var date = moment().add('days', 1);
          masterPlanner.query({
            from: date.toJSON()
          });
          expect(form(key))
            .to.equal(date.format('l'));
        });

      });

      describe('to', function () {

        before(function () {
          key = 'ctl00$txtDateTo';
        });

        it('is in one week by default', function () {
          masterPlanner.query();
          expect(form(key))
            .to.equal(moment().add('days', 6).format('l'));
        });

        it('can be set to another date', function () {
          var date = moment().add('days', 10);
          masterPlanner.query({
            to: date.toJSON()
          });
          expect(form(key))
            .to.equal(date.format('l'));
        });

      });

      it('sets non-changeable form parameters', function () {
        masterPlanner.query();
        expect(post.lastCall.args[0].form)
          .to.contain.keys('__EVENTTARGET', '__EVENTARGUMENT', 'ctl00$ddSearchType', 'ctl00$ddDateRange');
      });

    });

  });

});