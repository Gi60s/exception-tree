'use strict';
const { Exception }     = require('../dist/Exception');
const expect        = require('chai').expect;

describe('exception', () => {

  describe('no error', () => {

    it('no children', () => {
      const exception = new Exception('title');
      expect(exception.hasException).to.be.false;
      expect(exception.toString()).to.equal('');
    });

    it('"at" children', () => {
      const exception = new Exception('title');
      exception.at('a');
      expect(exception.hasException).to.be.false;
      expect(exception.toString()).to.equal('');
    });

    it('"nest" children', () => {
      const exception = new Exception('title');
      exception.nest('a');
      expect(exception.hasException).to.be.false;
      expect(exception.toString()).to.equal('');
    });

  });

  describe('single error', () => {

    it('no children', () => {
      const exception = new Exception('title');
      exception.message('hello', '');
      expect(exception.hasException).to.be.true;
      expect(exception.toString()).to.equal('title\n  hello');
    });

    it('"at" children', () => {
      const exception = new Exception('title');
      exception.at('a').message('hello', '');
      expect(exception.hasException).to.be.true;
      expect(exception.toString()).to.equal('title\n  at: a\n    hello');
    });

    it('"nest" children', () => {
      const exception = new Exception('title');
      exception.nest('a').message('hello');
      expect(exception.hasException).to.be.true;
      expect(exception.toString()).to.equal('title\n  a\n    hello');
    });

  });

  describe('"at" chain', () => {

    it('joins two chained "at"s into one', () => {
      const exception = new Exception('title');
      exception.at('a').at('b').message('hello');
      expect(exception.hasException).to.be.true;
      expect(exception.toString()).to.equal('title\n  at: a > b\n    hello');
    });

    it('joins 3 chained "at"s into one', () => {
      const exception = new Exception('title');
      exception.at('some key').at('anotherLongKey').at('abc').message('hello');
      expect(exception.hasException).to.be.true;
      expect(exception.toString()).to.equal('title\n  at: some key > anotherLongKey > abc\n    hello');
    });

    it('can have multi-level split chaining', () => {
      const exception = new Exception('title');
      const child = exception.at('a').at('b');
      child.at('c').message('one');
      child.message('two');
      expect(exception.hasException).to.be.true;
      expect(exception.toString()).to.equal('title\n  at: a > b\n    at: c\n      one\n    two');
    });

    it('can have multi-level split chaining with "nest"', () => {
      const exception = new Exception('title');
      const child = exception.at('a').at('b');
      child.at('c').message('one');
      child.nest('nest').message('two');
      expect(exception.hasException).to.be.true;
      expect(exception.toString()).to.equal('title\n  at: a > b\n    at: c\n      one\n    nest\n      two');
    });

    it('will link two at with same name', () => {
      const exception = new Exception('title');
      exception.at('a').message('one');
      exception.at('a').message('two');
      expect(exception.toString()).to.equal('title\n  at: a\n    one\n    two');
    });

  });

});
