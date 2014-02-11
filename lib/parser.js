'use strict';

var cheerio = require('cheerio'),
    S       = require('string'),
    moment  = require('moment');

var Parser = function (html) {
  this.$ = cheerio.load(html);
};

Parser.selectors = {
  date: '.evtList_Date',
  event: '.evtList_Evt'
};

Parser.prototype.content = function () {
  return this.$('#contentright');
};

Parser.prototype.dateNodes = function (content) {
  return content.children(Parser.selectors.date);
};

Parser.prototype.mapNodes = function (index, el) {
  return {
    dateNode: this.$(el),
    eventNodes: this.$(el).nextUntil(Parser.selectors.date).filter(Parser.selectors.event)
  };
};

Parser.prototype.parseDateNode = function (node) {
  var date = S(node.children('.evtList_Date_Head').text()).collapseWhitespace();
  return moment(date, 'dddd, MMMM D, YYYY');
};

module.exports = Parser;