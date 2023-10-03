const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
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

const routes = {
  '/': function(req, res) {
    res.render('urls_index', {urls: urlDatabase});
  },

  '/urls.json': function(req, res) {
    res.json(urlDatabase);
  },

  '/urls': function(req, res) {
    const templateVars = {urls: urlDatabase};
    res.render("urls_index", templateVars);
  },

  '/hello': function(req, res) {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  },

  '/urls/new': function(req, res) {
    res.render("urls_new");
  },

  '/urls/:id': function(req, res) {
    const vars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
    res.render('url_show', vars);
  },

  '/u/:id': function(req, res) {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
   }
};

const posts = {
  '/login': function(req, res) {
    const username = req.body.username;
    res.cookie('username', username);
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
    res.redirect('/urls')
  },

  '/urls': function(req, res) {
    const id = generateRandomString(6);
    urlDatabase[id] = req.body.longURL;
    res.redirect(`/urls/${id}`);
  },
}

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
