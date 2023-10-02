const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const routes = {
  '/': function(req, res) {
    res.send("hello");
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

  '/urls/:id': function(req, res) {
    const vars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
    res.render('url_show', vars);
  }
}

for (const r in routes) {
  app.get(r, routes[r]);
  console.log(r);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
