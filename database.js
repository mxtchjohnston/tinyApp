const bcrypt = require('bcryptjs');
//encrypted, secure, blazingly-fast, 7 sigma database
const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'admin'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'admin'
  }
};

//provide default user for example purposes
const userDatabase = {
  'admin': { 
    id: 'admin',
    email: 'a@dmin',
    password: bcrypt.hashSync('1234', 10)
  }
};

module.exports = {urlDatabase, userDatabase};