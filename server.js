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

// Order page
app.get("/order/example_id", (req, res) => {
  let menu = [];

   knex('menu').leftJoin('order_ticket', 'menu_id', '=', 'users.unique_id').asCallback( (err, query) => {
     const vars = {render: query};
     console.log(query);

     res.render("order", vars);
   });
});

// Dashboard page
app.get("/dashboard", (req, res) => {
  knex('order_list').join('menu','order_list.menu_id', 'menu.unique_id').select('order_list.order_id', 'menu.unique_id', 'name', 'description', 'price').then( (allOrders) => {

    let marker = '';
    let namePos = 0;
    let totalPrice = 0;
    let obj = {};
    allOrders.forEach( (item) => {
      if (marker === '' || marker !== item.order_id) {
        namePos = 0;
        marker = item.order_id;
        obj[item.order_id] = [];
      }

      let name = "menuItem" + namePos;
      obj[item.order_id].push({ name: item.name, description: item.description, price: item.price });
    });
    const allOrderList = obj;
     res.status(200).render('dashboard', allOrderList);
  });
});

// To place orders
app.post('/order', (req,res) => {
  //console.log(req.body);
  //console.log(req);
  const uName = req.body.name;
  const uPhone = req.body.phone;
  const orderedAt = new Date();
  let orderedItems = Object.values(req.body.order);
  // console.log(orderedItems);
  let eta;


  knex.from('users').where('name', uName).select('unique_id').then( function (resp) {
    if(resp.length < 1) {
      //create user
      knex('users').insert({ name: uName, phone_num: uPhone }).returning('*').then( function (newUser) {
        // creates ticket
        knex('order_ticket').insert({ user_id: newUser[0].unique_id, time_ordered: orderedAt }).returning('*').then( function (newOrder) {
          console.log("On new user: ", newOrder);
          // gets order menu items
          console.log(newOrder);
          knex('menu').whereIn('name', orderedItems).select('*').then(function (items) {
            // Insert menu items into order_list
            items.forEach(function (item) {
              knex('order_list').insert({ menu_id: item.unique_id, order_id: newOrder[0].unique_id, eta: Number(item.eta) }).returning('*').then( function (result) {
                  console.log(result);
              });
            }); // outside forEach
            res.redirect('/');
          });
        });
      });
    } else {
      // creates ticket
      knex('order_ticket').insert({ user_id: resp[0].unique_id, time_ordered: orderedAt }).returning('*').then( function (newOrder) {
          console.log("On old user: ", newOrder);
          // gets order menu items
          knex('menu').whereIn('name', orderedItems).select('*').then(function (items) {
            console.log(items);
            // Insert menu items into order_list
            items.forEach(function (item) {
              console.log(item.eta);
              knex('order_list').insert({ menu_id: item.unique_id, order_id: newOrder[0].unique_id, eta: Number(item.eta) }).returning('*').then( function (result) {
                  console.log(result);
              });
            }); // Outside forEach
            res.redirect('/');
          });
      });
    }
  });
}); // End request

// Route for user order
app.get('/order/:id', (req,res) => {
  const order = req.params.id;
      knex('order_list').select('order_list.menu_id').where('order_list.order_id', order).then( function (list) {
        const menuList = [];
        const qtyOfItems = [];
        Object.values(list).forEach( (item) => {
          menuList.push(item.menu_id);
          qtyOfItems.push(item.name, item.menu_id);
        });
        knex('menu').select('*').whereIn('menu.unique_id', menuList).then( function (items) {
          let currentNum = 0;
          let total = {};
          let count = 0;
          menuList.forEach( (elem) => {
            console.log(elem);
            if(currentNum === elem) {
              count = 1;
              total[currentNum] = count;
            }
            if(currentNum !== elem) {
              console.log(currentNum, elem);
              currentNum = elem;
              count += 1;
              total[currentNum] = count;
            }
          });
          const values = [items, total];
          console.log(values);
          res.render('order', values);
        });
      });
});

// Stretch (Multiple restaurants)
app.get('/dashboard/:id', (req,res) => {

});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
