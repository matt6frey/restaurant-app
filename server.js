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

//counts number of items in order_list
function count(array_elements) {
  array_elements.sort();
  var current = null;
  var count = 0;
  let resultArr = [];
  for (var i = 0; i < array_elements.length; i++) {
      if (array_elements[i] != current) {
          if (count > 0) {
              // console.log(current + ' comes --> ' + count + ' times');
              let tempArr = [];
              tempArr.push(current);
              tempArr.push(count);
              resultArr.push(tempArr);
          }
          current = array_elements[i];
          count = 1;
      } else {
          count++;
      }
  }
  if (count > 0) {
      //console.log(current + ' comes --> ' + count + ' times');
      let tingArr = [];
      tingArr.push(current);
      tingArr.push(count);
      resultArr.push(tingArr);
  }
  return resultArr;
}




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
  //let menu = [];
  let uu = [];
  knex('order_list').join('menu','order_list.meni_id', 'menu.unique_id').select('order_list.order_id', 'menu.unique_id', 'name', 'description', 'price').then( (allOrders) => {
    //console.log(allOrders);
    let marker = '';
    let namePos = 0;
    let totalPrice = 0;
    let obj = {};
    allOrders.forEach( (item) => {
      if (marker === '' || marker !== item.order_id) {
        namePos = 0;
        totalPrice = 0;
        marker = item.order_id;
        obj[item.order_id] = [];
      }

      let name = "menuItem" + namePos;
      obj[item.order_id].push({ name: item.name, description: item.description, price: item.price });
    });

   //creates array without duplicating items
    for (var order_id in obj) {

      let arr = [];
      obj[order_id].forEach(function(food_item) {
        arr.push(food_item.name);
      });
      let duplicateArr = count(arr);
      console.log(duplicateArr);

      var objj= {};
      objj['order_id'] = order_id;
      objj['items']={};
      for(let i = 0; i < duplicateArr.length; i ++) {
        let name = `item${i+1}`
        objj['items'][name] = duplicateArr[i];
      }
      uu.push(objj);
    }

    let nameArr = [];
    for (var order_id in obj) {
      let listArr = obj[order_id];
      obj[order_id].forEach(function(item) {
        nameArr.push(item);
      })
    }

    //put in description for each item
    for (let i = 0; i < uu.length; i ++) {
      // console.log(uu[i].items)
      for (var prop in uu[i].items) {
        // console.log(uu[i].items[prop][0]);
        // console.log(uu[i].items[prop]);
        let aaa = uu[i].items[prop];
        let food_name = uu[i].items[prop][0];
        nameArr.forEach(function(item) {
          // console.log(item);
          if (item.name === food_name){
            aaa.push(item.description);
          }
        });
      }
    }
    // console.log(uu[0].items);
    uu.forEach(function(item) {
      // console.log(item.items);
      for (let prop in item.items) {
        // console.log(item.items[prop]);
        // let arr = item.items[prop];
        // item.items[prop].slice(1,3);
        // console.log(item.items[prop].slice(0,3));
        // item.items[prop].slice(0,3);
        item.items[prop] = item.items[prop].slice(0,3);
      }
    });


    //put in price for each item
    for (let i = 0; i < uu.length; i ++) {
      // console.log(uu[i].items)
      for (var prop in uu[i].items) {
        // console.log(uu[i].items[prop][0]);
        // console.log(uu[i].items[prop]);
        let aaa = uu[i].items[prop];
        let food_name = uu[i].items[prop][0];
        nameArr.forEach(function(item) {
          // console.log(item);
          if (item.name === food_name){
            aaa.push(item.price);
          }
        });
      }
    }
    uu.forEach(function(item) {
      // console.log(item.items);
      for (let prop in item.items) {
        // console.log(item.items[prop]);
        // let arr = item.items[prop];
        // item.items[prop].slice(1,3);
        // console.log(item.items[prop].slice(0,3));
        // item.items[prop].slice(0,3);
        item.items[prop] = item.items[prop].slice(0,4);
      }
    });

    //puts total price for order
    uu.forEach(function(item) {
      // console.log(item.items);
      let total = 0;
      for (let prop in item.items) {
        // console.log(item.items[prop]);
        total += Number(item.items[prop][3]);
        // let arr = item.items[prop];
        // item.items[prop].slice(1,3);
        // console.log(item.items[prop].slice(0,3));
        // item.items[prop].slice(0,3);
        // item.items[prop] = item.items[prop].slice(0,3);
      }
      // console.log(total);
      // console.log(item);
      item['total_price'] = total;
    });
    // console.log(uu);

      const vars = {render: uu};

     res.render("dashboard", vars);

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
              knex('order_list').insert({ meni_id: item.unique_id, order_id: newOrder[0].unique_id, eta: Number(item.eta) }).returning('*').then( function (result) {
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
              knex('order_list').insert({ meni_id: item.unique_id, order_id: newOrder[0].unique_id, eta: Number(item.eta) }).returning('*').then( function (result) {
                  console.log(result);
              });
            }); // Outside forEach
            res.redirect('/');
          });
      });
    }
  });
}); // End request


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});






