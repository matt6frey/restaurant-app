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

  knex.select('*').from('users').where('phone_num', 'like', `${req.body.phone}`).andWhere('name', 'like', `${req.body.name}`).asCallback(function(error, result) {
      //checks if exists in database
      if (result.length === 0) {
        console.log("doesn't exist");
        //if it user passes captcha test on website, the following puts name and number into databse if doesn't exist
        knex('users').insert([
        {name: req.body.name,
         phone_num: req.body.phone}
          ]).asCallback(function(error, rows) {
          knex.select('*').from('users').asCallback(function(error, rows) {
           // console.log(rows);
         });
       });
      } else {
        //makes new order_ticket with timestamp
        knex.select('unique_id').from('users').where('name', 'like', `${req.body.name}`).asCallback(function(error, result) {
          knex('order_ticket').insert([
            {user_id: result[0].unique_id,
             time_ordered: new Date}
              ]).asCallback(function(error, rows) {
              knex.select('*').from('order_ticket').asCallback(function(error, rows) {
              // console.log(rows);
             });
           });
           // console.log(result[0].unique_id);
           // var userID = result[0].unique_id;

         });
        //puts order ticket id into order_list to be associated with user
        for (let item in req.body.order) {
          //gets menu id from menu table
         knex.select('unique_id').from('menu').where('name', 'like', `${req.body.order[item]}`).asCallback(function(error, result) {
           var meniID = result[0].unique_id;
           //gets userid from users table
           knex.select('unique_id').from('users').where('name', 'like', `${req.body.name}`).asCallback(function(error, result)  {
              var userID = result[0].unique_id;
              //gets orderid from order_ticket table
            knex.select('unique_id').from('order_ticket').where('user_id', 'like', `${userID}`).asCallback(function(error, result)  {
                var orderID = result[0].unique_id;
                //inserts menuid and order id into order_list
                knex('order_list').insert([
                {meni_id: meniID,
                 order_id: orderID}
                  ]).asCallback(function(error, rows) {
                  knex.select('*').from('order_list').asCallback(function(error, rows) {
                   console.log(rows.length);
                 });
               });


            });

           });

         });
        }
      }
   });
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
