const { assert } = require('chai');

const { getUserByEmail, generateRandomString, getUrlsForUser} = require('../util.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrls = {
  "randomURL": {
    longURL: 'example.com',
    userID: 'userRandomID'
  },
  "anotherURL": {
    longURL: 'google.com',
    userID: 'user2RandomID'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined when email is malformed', function() {
    const user = getUserByEmail("user@example", testUsers);
    assert.isUndefined(user);
  });
});

describe('generateRandomString', function() {
  it('should be a specified length', function() {
    const len = 6;
    assert.equal(len, generateRandomString(len).length);
  });

  it('should be return different ids most of the time (pseudo random)', function() {
    assert.notEqual(generateRandomString(6), generateRandomString(6));
  });
});

describe('getUrlsForUser', function() {
  it('should return appropriate urls for given user id', function() {
    assert.deepEqual(getUrlsForUser(testUrls, 'userRandomID'), {randomURL: testUrls['randomURL']});
  });
});