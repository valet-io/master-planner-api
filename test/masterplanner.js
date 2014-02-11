'use strict';

var expect        = require('chai').expect,
    sinon         = require('sinon'),
    request       = require('request'),
    MasterPlanner = require('../lib/masterplanner');

describe('MasterPlanner', function () {

  var masterPlanner;

  beforeEach(function () {
    masterPlanner = new MasterPlanner('newyork', {
      email: 'email',
      password: 'pass'
    });
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
    var post;

    beforeEach(function () {
      post = sinon.stub(request, 'post');
    });

    afterEach(function () {
      post.restore();
    });

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

});