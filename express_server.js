//Imports
const express = require('express');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const util = require('./util');
const db = require('./database.js');

const PORT = 8080; // default port 8080



//set up app
const app = express();
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: [bcrypt.hashSync('qwerty', 10)],
}));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));


const userDatabase = db.userDatabase;
const urlDatabase = db.urlDatabase;

//Whats a route anyway? paths and functions? sounds like an object to me
const routes = {
  '/': (req, res) => {
    res.redirect('/urls');
  },

  '/register': (req, res) => {
    if (req.session.userID) {
      return res.redirect('urls');
    }
    res.render('pages/register', {user: userDatabase[req.session.userID]});
  },

  '/login': (req, res) => {
    if (req.session.userID) {
      return res.redirect('urls');
    }
    res.render('pages/login', {user: userDatabase[req.session.userID]});
  },

  '/urls': (req, res) => {
    const userID = req.session.userID;
    if (!userID) {
      const templateVars = {user: undefined, message: 'You must be logged in to view the urls page'};
      return res.status(400).render('pages/error', templateVars);
    }
    const urls = util.getUrlsForUser(urlDatabase, userID);
    const templateVars = {urls, user: userDatabase[userID]};
    res.render('pages/urls_index', templateVars);
  },

  '/urls/new': (req, res) => {
    if (!req.session.userID) {
      return res.redirect('/login');
    }
    res.render('pages/urls_new', {user: userDatabase[req.session.userID]});
  },

  '/urls/:id': (req, res) => {
    if (!urlDatabase[req.params.id]) {
      const templateVars = {message: 'This ID is not in our database', user: userDatabase[req.session.userID]};
      return res.status(400).render('pages/error', templateVars);
    }

    if (req.session.userID !== urlDatabase[req.params.id].userID) {
      const templateVars = {message: 'You do not have permission to edit this resource', user: userDatabase[req.session.userID]};
      return res.status(400).render('pages/error', templateVars);
    }

    const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: userDatabase[req.session.userID]};
    res.render('pages/url_show', templateVars);
  },

  '/u/:id': (req, res) => {
    const URL = urlDatabase[req.params.id];
    if (!URL) {
      const templateVars = {user: userDatabase[req.session.userID], message: 'This url is not in our Database'};
      return res.status(404).render('pages/error', templateVars);
    }
    res.redirect(URL.longURL);
  }
};

//same goes for post requests
const posts = {
  '/login': (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //if empty
    if (email === '' || password === '') {
      const templateVars = {message: 'Please enter an email and/or password', user: userDatabase[req.session.userID]};
      return res.status(400).render('pages/error', templateVars);
    }

    const user = util.getUserByEmail(email, userDatabase);
    //if user does not exist
    if (!user) {
      const templateVars = {message: 'User is not registered yet', user: userDatabase[req.session.userID]};
      return res.status(400).render('pages/error', templateVars);
    }
    //check password equality
    if (bcrypt.compareSync(password, user.password)) {
      req.session.userID = user.id;
      res.redirect('/urls');
    } else {
      const templateVars = {message: 'Somethings wrong with your email/password', user: userDatabase[req.session.userID]};
      return res.status(403).render('pages/error', templateVars);
    }
  },

  '/register': (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //if empty
    if (email === '' || password === '') {
      const templateVars = {message: 'Please enter an email and/or password', user: userDatabase[req.session.userID]};
      return res.status(400).render('pages/error', templateVars);
    }

    //if email exists
    if (util.getUserByEmail(email, userDatabase)) {
      const templateVars = {message: 'User is already exists', user: userDatabase[req.session.userID]};
      return res.status(400).render('pages/error', templateVars);
    }

    //continue if checks pass
    const id = util.generateRandomString(6);


    userDatabase[id] = {id, email, password: bcrypt.hashSync(password, 10)};
    req.session.userID = id;
    res.redirect('/urls');
  },

  '/logout': (req, res) => {
    req.session = null;
    res.redirect('/urls');
  },

  '/urls/:id/delete': (req, res) => {
    const id = req.params.id;

    //check permissions
    if (req.session.userID !== urlDatabase[id].userID) {
      const templateVars = {message: 'You do not have permission to edit this resource', user: userDatabase[req.session.userID]};
      return res.status(400).render('pages/error', templateVars);
    }
    
    delete urlDatabase[id];
    res.redirect(`/urls`);
  },

  '/urls/:id': (req, res) => {
    
    const longURL = req.body.field;
    const id = req.params.id;
    const userID = req.session.userID;

    if (userID !== urlDatabase[id].userID) {
      const templateVars = {message: 'You do not have permission to edit this resource', user: userDatabase[req.session.userID]};
      return res.status(400).render('pages/error', templateVars);
    }

    urlDatabase[id] = {longURL, userID};
    res.redirect('/urls');
  },

  '/urls': (req, res) => {
    const userID = req.session.userID;
    if (!userID) {
      const templateVars = {message: 'You do must be logged in to create a url', user: userDatabase[req.session.userID]};
      return res.status(400).render('pages/error', templateVars);
    }
    const id = util.generateRandomString(6);
    urlDatabase[id] = { longURL: req.body.longURL, userID};
    res.redirect(`/urls/${id}`);
  },
};

//assign routes to app GETS
for (const r in routes) {
  app.get(r, routes[r]);
}

//asign posts to app POSTS
for (const p in posts) {
  app.post(p, posts[p]);
}

//Amen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
