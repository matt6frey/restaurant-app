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

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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
  // console.log("REQ: \n\n", req.body, "\n\nRES: \n\n", res);
  let menu = [];
  knex.select('*').from('menu').asCallback( (err, query) => {
    menu.push(query);
  });
  // Send Menu items to home page.
  res.render("index", menu);
});

// To place orders
app.post('/order', (req,res) => {
  //console.log(req.body);
  //console.log(req);
  const uName = req.body.name;
  const uPhone = req.body.phone;
  const orderedAt = new Date();
  let orderedItems = Object.values(req.body.order);
  console.log(orderedItems);
  let eta;


  knex.from('users').where('name', uName).select('unique_id').then( function (res) {
    if(res.length < 1) {
      //create user
      knex('users').insert({ name: uName, phone_num: uPhone }).returning('*').then( function (newUser) {
        // creates ticket
        knex('ordered_ticket').insert({ user_id: newUser[0].unique_id, time_ordered: orderedAt }).then( function (newOrder) {
          console.log("On new user: ", newOrder);
          // gets order menu items
          knex('menu').whereIn('name', orderedItems).select('*').then(function (items) {
            // Insert menu items into order_list
            items.forEach(function (item) {
              knex('order_list').insert({ meni_id: item.unique_id, order_id: newOrder[0].unique_id, ETA: Number(item.eta) }).returning('*').then( function (result) {
                  console.log(result);
              });
            });
          });
        });
      });
    } else {
      // creates ticket
      knex('order_ticket').insert({ user_id: res[0].unique_id, time_ordered: orderedAt }).returning('*').then( function (newOrder) {
          console.log("On old user: ", newOrder);
          // gets order menu items
          knex('menu').whereIn('name', orderedItems).select('*').then(function (items) {
            console.log(items);
            // Insert menu items into order_list
            items.forEach(function (item) {
              console.log(item.eta);
              knex('order_list').insert({ meni_id: item.unique_id, order_id: newOrder[0].unique_id, ETA: Number(item.eta) }).returning('*').then( function (result) {
                  console.log(result);
              });
            });
          });
      });
      //create user
    }
  });
}); // End request

// Route for user order
app.get('/order/:id', (req,res) => {
  let user_order = [];
  knex.select('*').from('menu').asCallback( (err, query) => {
    user_order.push(query);
  });
  res.render('order', user_order);
});

app.get('/dashboard/:id', (req,res) => {

});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
