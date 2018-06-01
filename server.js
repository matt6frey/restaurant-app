"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

const renderItemContainer = require('./public/scripts/app.js')

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));


// Home page
app.get("/", (req, res) => {
  let menu = [];

  knex.select('*').from('menu').asCallback( (err, query) => {
    const vars = {render: query};
    console.log(query);

    res.render("index", vars);
  });
});

// Order page
app.get("/order/example_id", (req, res) => {
  let menu = [];

   knex('menu').join('order_ticket', 'meni_id', '=', 'users.unique_id').asCallback( (err, query) => {
     const vars = {render: query};
     console.log(query);

     res.render("order", vars);
   });
});

// Dashboard page
app.get("/dashboard", (req, res) => {
  let menu = [];

  knex.select('*').from('order_list').asCallback( (err, query) => {
    const vars = {render: query};
    console.log(query);

    res.render("dashboard", vars);
  });
});

// To place orders
app.post('/order', (req,res) => {

});

app.get('/order/:id', (req,res) => {

});

//owner's dashboard
app.get('/dashboard/:id', (req,res) => {

});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
