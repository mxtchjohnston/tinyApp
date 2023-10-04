const express = require("express");
const app = express();
const cookie = require('cookie-parser');
const morgan = require('morgan');
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(cookie());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

const generateRandomString = function(num) {
  const randomNum = () => Math.floor(Math.random() * 26) + 97;
  const array = [];
  for (let i = 0; i < num; i++) {
    array.push(randomNum());
  }
  return String.fromCodePoint(...array);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {};

const getUserByEmail = function(email) {
  let found = undefined;

  for (const key in userDatabase) {
    if (userDatabase[key].email === email) {
      found = userDatabase[key];
      break;
    }
  }

  return found;
};

const routes = {
  '/': function(req, res) {
    res.redirect('/urls');
  },

  '/register': function(req, res) {
    res.render('register', {user: userDatabase[req.cookies.userID]});
  },

  '/login': function(req, res) {
    res.render('login', {user: userDatabase[req.cookies.userID]});
  },

  '/urls.json': function(req, res) {
    res.json(urlDatabase);
  },

  '/urls': function(req, res) {
    const templateVars = {urls: urlDatabase, user: userDatabase[req.cookies.userID]};
    res.render("urls_index", templateVars);
  },

  '/urls/new': function(req, res) {
    res.render("urls_new", {user: userDatabase[req.cookies.userID]});
  },

  '/urls/:id': function(req, res) {
    const vars = {id: req.params.id, longURL: urlDatabase[req.params.id], user: userDatabase[req.cookies.userID]};
    res.render('url_show', vars);
  },

  '/u/:id': function(req, res) {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  }
};

const posts = {
  '/login': function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    //if empty
    if (email === "" || password === "") {
      res.status(400).send("Please enter an email and/or password");
      return;
    }

    const user = getUserByEmail(email);

    if (user.password === password) {
      res.cookie('userID', user.id);
      res.redirect('/urls');
    } else {
      res.status(403).send("Somethings wrong with your username and password");
    }
  },

  '/register': function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    //if empty
    if (email === "" || password === "") {
      res.status(400).send("Please enter an email and/or password");
      return;
    }

    //if email exists
    if (getUserByEmail(email)) {
      res.status(400).send("User already exists");
      return;
    }

    const id = generateRandomString(6);

    userDatabase[id] = {id, email, password};
    //res.cookie('userID', userDatabase[id]);
    //console.log(userDatabase);
    res.redirect('/login');
  },

  '/logout': function(req, res) {
    res.clearCookie('userID');
    res.redirect('/urls');
  },

  '/urls/:id/delete': function(req, res) {
    const id = req.params.id;
    //console.log(id);
    delete urlDatabase[id];
    res.redirect(`/urls`);
  },

  '/urls/:id': function(req, res) {
    // console.log(req.body.field);
    // console.log(req.params.id);
    const field = req.body.field;
    const id = req.params.id;
    urlDatabase[id] = field;
    res.redirect('/urls');
  },

  '/urls': function(req, res) {
    const id = generateRandomString(6);
    urlDatabase[id] = req.body.longURL;
    res.redirect(`/urls/${id}`);
  },
};

for (const r in routes) {
  app.get(r, routes[r]);
  //console.log(r);
}

for (const p in posts) {
  app.post(p, posts[p]);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
