const express = require("express");
const cookie = require('cookie-parser');
const morgan = require('morgan');
const util = require('./util');
const PORT = 8080; // default port 8080

//BCRYPT EXAMPLE
const bcrypt = require('bcryptjs');
console.log(bcrypt);

const salt = bcrypt.genSaltSync(10);
// console.log('salt:', salt);

// const hashed = bcrypt.hashSync('1234', salt);

// console.log(bcrypt.compareSync('monkey', hashed));
//

//set up app
const app = express();
app.set('view engine', 'ejs');
app.use(cookie());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));


//encrypted, secure, blazingly-fast, 7 sigma database
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'admin'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'admin'
  }
};

const userDatabase = {
  "admin": {
    id: "admin",
    email: "a@dmin",
    password: bcrypt.hashSync('1234', 10)
  }
};

//Whats a route anyway? paths and functions? sounds like an object to me
const routes = {
  '/': (req, res) => {
    res.redirect('/urls');
  },

  '/register': (req, res) => {
    if (req.cookies.userID) {
      return res.redirect('urls');
    }
    res.render('register', {user: userDatabase[req.cookies.userID]});
  },

  '/login': (req, res) => {
    if (req.cookies.userID) {
      return res.redirect('urls');
    }
    res.render('login', {user: userDatabase[req.cookies.userID]});
  },

  '/urls.json': (req, res) => {
    res.json(urlDatabase);
  },

  '/urls': (req, res) => {
    const userID = req.cookies.userID;
    if (!userID) {
      return res.redirect('/login');
    }
    const urls = util.getUrlsForUser(urlDatabase, userID);
    const templateVars = {urls, user: userDatabase[userID]};
    res.render("urls_index", templateVars);
  },

  '/urls/new': (req, res) => {
    if (!req.cookies.userID) {
      return res.redirect('/login');
    }
    res.render("urls_new", {user: userDatabase[req.cookies.userID]});
  },

  '/urls/:id': (req, res) => {
    if (!urlDatabase[req.params.id]) {
      return res.status(400).send('This Id is not in our database');
    }

    const vars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: userDatabase[req.cookies.userID]};
    res.render('url_show', vars);
  },

  '/u/:id': (req, res) => {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
};

//same goes for post requests
const posts = {
  '/login': (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //if empty
    if (email === "" || password === "") {
      res.status(400).send("Please enter an email and/or password");
      return;
    }

    const user = util.getUserByEmail(email, userDatabase);

    if (!user) {
      return res.status(400).send('User not found');
    }
    if (bcrypt.compareSync(password, user.password)) {
      res.cookie('userID', user.id);
      res.redirect('/urls');
    } else {
      res.status(403).send("Somethings wrong with your username and password");
    }
  },

  '/register': (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //if empty
    if (email === "" || password === "") {
      res.status(400).send("Please enter an email and/or password");
      return;
    }

    //if email exists
    if (util.getUserByEmail(email, userDatabase)) {
      res.status(400).send("User already exists");
      return;
    }

    const id = util.generateRandomString(6);


    userDatabase[id] = {id, email, password: bcrypt.hashSync(password, 10)};
    //res.cookie('userID', userDatabase[id]);
    console.log(userDatabase);
    res.cookie('userID', id);
    res.redirect('/urls');
  },

  '/logout': (req, res) => {
    res.clearCookie('userID');
    res.redirect('/urls');
  },

  '/urls/:id/delete': (req, res) => {
    const id = req.params.id;
    if (req.cookies.userID !== urlDatabase[id].userID) {
      return res.status(400).send('You do not have permission to modify this resource');
    }
    //console.log(id);
    delete urlDatabase[id];
    res.redirect(`/urls`);
  },

  '/urls/:id': (req, res) => {
    // console.log(req.body.field);
    // console.log(req.params.id);
    
    const longURL = req.body.field;
    const id = req.params.id;
    const userID = req.cookies.userID;

    if (userID !== urlDatabase[id].userID) {
      return res.status(400).send('You do not have permission to modify this resource');
    }

    urlDatabase[id] = {longURL, userID};
    console.log(urlDatabase);
    res.redirect('/urls');
  },

  '/urls': (req, res) => {
    const userID = req.cookies.userID;
    if (!userID) {
      return res.status(400).send('You must be logged in to create a new url');
    }
    const id = util.generateRandomString(6);
    urlDatabase[id] = { longURL: req.body.longURL, userID};
    res.redirect(`/urls/${id}`);
  },
};

//assign routes to app GETS
for (const r in routes) {
  app.get(r, routes[r]);
  //console.log(r);
}

//asign posts to app POSTS
for (const p in posts) {
  app.post(p, posts[p]);
}

//Amen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
