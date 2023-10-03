const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const generateRandomString = function(num) {
  const randomNum = () => Math.floor(Math.random() * 94) + 32;
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

for (const r in routes) {
  app.get(r, routes[r]);
  //console.log(r);
}

app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const id = generateRandomString(6);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`urls/${id}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
