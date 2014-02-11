var expect  = require('chai').expect,
    Promise = require('bluebird'),
    fs      = require('fs'),
    moment  = require('moment'),
    Parser  = require('../lib/parser');

describe('Parser', function () {

  var html, parser;

  before(function () {
    return Promise.promisify(fs.readFile)(__dirname + '/mocks/page.html')
      .then(function (data) {
        html = data;
      });
  });

  before(function () {
    parser = new Parser(html);
  });

  describe('Constructor', function () {

    it('assigns a cheerio instance', function () {
      expect(new Parser())
        .to.respondTo('$');
    });

  });

  var content, dateNodes;

  describe('Parser.selectors', function () {

    it('supplies a date selector', function () {
      expect(Parser)
        .to.have.deep.property('selectors.date');
    });

    it('supplies an event selector', function () {
      expect(Parser)
        .to.have.deep.property('selectors.event');
    });

  });

  describe('#content', function () {
    
    it('returns the content node', function () {
      content = parser.content()
      expect(content.children().first()[0])
        .to.have.property('name', 'h1');
    });

  });

  describe('#dateNodes', function () {

    it('returns the date nodes', function () {
      dateNodes = parser.dateNodes(content);
      expect(dateNodes)
        .to.have.length(6);
    });

  });

  describe('#mapNodes', function () {

    it('maps date nodes to their event nodes', function () {
      var mapNodes = dateNodes.map(parser.mapNodes.bind(parser));
      expect(mapNodes[0].eventNodes).to.have.length(4)
      expect(mapNodes[5].eventNodes).to.have.length(1);
    });

  });

  describe('#parseDateNode', function () {

    it('parses a date node into a moment.js date', function () {
      var node = dateNodes.first();
      expect(moment('2014-02-11').isSame(parser.parseDateNode(node)))
        .to.be.true;
    });

  });

});