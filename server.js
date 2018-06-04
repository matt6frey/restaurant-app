"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();
const SID         = process.env.SID;
const AUTH        = process.env.AUTH;
const twilio      = require('twilio');
const moment      = require('moment-timezone');

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const client = new twilio(SID, AUTH);

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

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
    //console.log(query);

    res.status(200).render("index", vars);
  });
});

// Dashboard page
app.get("/dashboard", (req, res) => {

  let finalArray = [];
  knex('order_list').join('menu','order_list.menu_id', 'menu.unique_id').join('order_ticket','order_list.order_id', 'order_ticket.unique_id').select('order_list.order_id', 'menu.unique_id', 'name', 'description', 'price', 'time_ordered').then( (allOrders) => {
    //to debug result of sql query: console.log(allOrders);
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

      let food_item_array = [];
      obj[order_id].forEach(function(food_item) {
        food_item_array.push(food_item.name);
      });
      let array_without_duplicates = count(food_item_array);
      //to debug array without duplicates: console.log(array_without_duplicates);

      var finalObj= {};
      finalObj['order_id'] = order_id;
      finalObj['items']={};
      for(let i = 0; i < array_without_duplicates.length; i ++) {
        let name = `item${i+1}`;
        finalObj['items'][name] = array_without_duplicates[i];
      }
      finalArray.push(finalObj);
    }

    let nameArray = [];
    for (var order_id in obj) {
      let listArr = obj[order_id];
      obj[order_id].forEach(function(item) {
        nameArray.push(item);
      });
    }
    //creates array without duplicating items

    //put in description for each item
    for (let i = 0; i < finalArray.length; i ++) {

      for (var prop in finalArray[i].items) {
        let tempArray = finalArray[i].items[prop];
        let food_name = finalArray[i].items[prop][0];
        nameArray.forEach(function(item) {

          if (item.name === food_name){
            tempArray.push(item.description);
          }
        });
      }
    }

    finalArray.forEach(function(item) {

      for (let prop in item.items) {
        item.items[prop] = item.items[prop].slice(0,3);
      }
    });
    //put in description for each item

    //put in price for each item
    for (let i = 0; i < finalArray.length; i ++) {

      for (var prop in finalArray[i].items) {
        let tempArray = finalArray[i].items[prop];
        let food_name = finalArray[i].items[prop][0];
        nameArray.forEach(function(item) {

          if (item.name === food_name){
            tempArray.push(item.price);
          }
        });
      }
    }

    finalArray.forEach(function(item) {

      for (let prop in item.items) {
        item.items[prop] = item.items[prop].slice(0,4);
      }
    });
    //put in price for each item

    //puts total price for order
    finalArray.forEach(function(item) {

      let total = 0;
      for (let prop in item.items) {
        total += Number(item.items[prop][3]);
      }
      item['total_price'] = total;
    });
     //puts total price for order

     //puts date for order
    let check = '';
    let timeObj = {};
    allOrders.forEach( (item) => {

      if (check === '' || check !== item.order_id) {
        check = item.order_id;
        timeObj[item.order_id] = [];
      }
      timeObj['time_ordered'] = item.time_ordered;
    });

    finalArray.forEach(function(item) {
    let options = {
      year: "numeric", month: "short",
      day: "numeric", hour: "2-digit", minute: "2-digit"
    };
      item['time_ordered'] = timeObj.time_ordered.toLocaleTimeString("en-us", options);
    });
    //puts date for order

    //debug final array: console.log(finalArray[0]);

    const vars = {render: finalArray};
    res.status(200).render("dashboard", vars);
  });

});


// To place orders
app.post('/order', (req,res) => {
 const uName = req.body.name;
 const uPhone = Number(req.body.phone);
 const orderedAt = moment(new Date()).tz('America/Edmonton').format();
 const timeDisplay = moment(new Date()).tz('America/Edmonton').format("dddd, MMMM Do YYYY, h:mm:ss a");
 let orderedItems = Object.values(req.body.order);
 let eta;

 console.log(orderedAt);

 let options = {
      year: "numeric", month: "short",
      day: "numeric", hour: "2-digit", minute: "2-digit"
    }; // For time format

 knex.from('users').where('name', uName).select('unique_id').then( function (resp) {
   if(resp.length < 1) {
     //create user
     knex('users').insert({ name: uName, phone_num: uPhone }).returning('*').then( function (newUser) {
       // creates ticket
       knex('order_ticket').insert({ user_id: newUser[0].unique_id, time_ordered: orderedAt }).returning('*').then( function (newOrder) {
         orderedItems.map( (orderedItem) => {
            // get menu items
            knex('menu').where('name', orderedItem).select('*').then((item) => {
              // insert menu items
              knex('order_list').insert({ menu_id: item[0].unique_id, order_id: newOrder[0].unique_id, eta: Number(item[0].eta) }).returning('*').then( function (result) {
                 //console.log("FROM RESULTS: ", result);
                });
              })
            });
            client.messages.create({
              body: `Hey Boss! You have a new order, order at ${ timeDisplay }. To see the order, check out: http://localhost:8080/dashboard`,
              to: `+1${ process.env.RESTAURANT_NUM }`,  // Text this number
              from: `+${ process.env.NUM }` // From a valid Twilio number
            })
            .then((message) => console.log(message.sid));
           res.redirect('/');
       });
     });
   } else {
     // creates ticket
     knex('order_ticket').insert({ user_id: resp[0].unique_id, time_ordered: orderedAt }).returning('*').then( function (newOrder) {
           orderedItems.map( (orderedItem) => {
            // get menu items
            knex('menu').where('name', orderedItem).select('*').then((item) => {
              // insert menu items
              knex('order_list').insert({ menu_id: item[0].unique_id, order_id: newOrder[0].unique_id, eta: Number(item[0].eta) }).returning('*').then( function (result) {
                 //console.log("FROM RESULTS: ", result);
                });
              })
            });
           client.messages.create({
              body: `Hey, You have a new order, order at ${ orderedAt }. To see the order, check out: http://localhost:8080/dashboard`,
              to: `+1${ process.env.RESTAURANT_NUM }`,  // Text this number
              from: `+${ process.env.NUM }` // From a valid Twilio number
            })
            .then((message) => console.log(message.sid));
           res.redirect('/');
          });
   }
 });
});

// Route for user order
app.get('/order/:id', (req,res) => {
 const orderID = req.params.id;

 let finalArray = [];
 knex('order_list').join('menu','order_list.menu_id', 'menu.unique_id').join('order_ticket','order_list.order_id', 'order_ticket.unique_id').select('order_list.order_id', 'menu.unique_id', 'name', 'description', 'price', 'time_ordered').where('order_list.order_id', '=', `${ orderID }`).then( (allOrders) => {
  //debug allOrders result: console.log(allOrders)
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

  // //creates array without duplicating items
  for (var order_id in obj) {

    let food_item_array = [];
    obj[order_id].forEach(function(food_item) {
      food_item_array.push(food_item.name);
    });
    let array_without_duplicates = count(food_item_array);
    //to debug array without duplicates: console.log(array_without_duplicates);

    var finalObj= {};
    finalObj['order_id'] = order_id;
    finalObj['items']={};
    for(let i = 0; i < array_without_duplicates.length; i ++) {
      let name = `item${i+1}`
      finalObj['items'][name] = array_without_duplicates[i];
    }
    finalArray.push(finalObj);
  }

  let nameArray = [];
  for (var order_id in obj) {
    let listArr = obj[order_id];
    obj[order_id].forEach(function(item) {
      nameArray.push(item);
    })
  }
  // //creates array without duplicating items

  // //put in description for each item
    for (let i = 0; i < finalArray.length; i ++) {

      for (var prop in finalArray[i].items) {
        let tempArray = finalArray[i].items[prop];
        let food_name = finalArray[i].items[prop][0];
        nameArray.forEach(function(item) {

          if (item.name === food_name){
            tempArray.push(item.description);
          }
        });
      }
    }

    finalArray.forEach(function(item) {

      for (let prop in item.items) {
        item.items[prop] = item.items[prop].slice(0,3);
      }
    });
  //   //put in description for each item

  //   //put in price for each item
    for (let i = 0; i < finalArray.length; i ++) {

      for (var prop in finalArray[i].items) {
        let tempArray = finalArray[i].items[prop];
        let food_name = finalArray[i].items[prop][0];
        nameArray.forEach(function(item) {

          if (item.name === food_name){
            tempArray.push(item.price);
          }
        });
      }
    }

    finalArray.forEach(function(item) {

      for (let prop in item.items) {
        item.items[prop] = item.items[prop].slice(0,4);
      }
    });
  //   //put in price for each item

  //   //puts total price for order
    finalArray.forEach(function(item) {

      let total = 0;
      for (let prop in item.items) {
        total += Number(item.items[prop][3]);
      }
      item['total_price'] = total;
    });
     //puts total price for order

     //puts date for order
    let check = '';
    let timeObj = {};
    allOrders.forEach( (item) => {

      if (check === '' || check !== item.order_id) {
        check = item.order_id;
        timeObj[item.order_id] = [];
      }
      timeObj['time_ordered'] = item.time_ordered;
    });

    finalArray.forEach(function(item) {
    let options = {
      year: "numeric", month: "short",
      day: "numeric", hour: "2-digit", minute: "2-digit"
    };
      item['time_ordered'] = timeObj.time_ordered.toLocaleTimeString("en-us", options);
    });
    //puts date for order

    //debug final array: console.log(finalArray[0]);

    const vars = {render: finalArray[0]};
    res.status(200).render("order", vars);

  });
});

app.post('/delete', (req, res) => {

  const id = req.body.id;
  console.log("ID: ", id);

  knex('order_ticket').where('unique_id', Number(id)).select('complete').update("complete", true).then((updated) => {
      console.log(updated);
      res.sendStatus(200);
    });
  // knex.select('complete').from('order_list').where('order_ticket.unqiue', id).update().then( (column) => {

  }) // order

app.post('/new-notify', (req,res) => {
  const orderID = req.body.id; // Order for customer
  const eta = req.body.eta; // Restaurant's ETA

  knex('order_ticket').join('users','order_ticket.user_id', 'users.unique_id').select('users.name', 'users.phone_num').where("order_ticket.unique_id", Number(orderID)).then( (customer) => {
    // Customer Info & Company Location/Order Link
    const name = customer[0].name;
    const phoneNum = customer[0].phone_num;
    const location = "111 Main Street NW, Calgary, AB, T1Y 1P4";
    const url = 'http://localhost:8080/order/' + orderID;

    // Send initial notification
    client.messages.create({
        body: `Hey ${ name }, Your order has been recieved and will be ready in ${ eta } minutes. For more details regarding your order, check out: ${ url }`,
        to: '+1' + phoneNum,  // Text this number
        from: `+${ process.env.NUM }` // From a valid Twilio number
    })
    .then((message) => console.log(message.sid));
    // Sets a timeout for the order completion text.
    setTimeout( (completed) => {
      client.messages.create({
          body: `Hey ${ name }, Your order is ready for pick up at our location: ${ location }.`,
          to: '+1' + phoneNum,  // Text this number
          from: `+${ process.env.NUM }` // From a valid Twilio number
      })
      .then((message) => console.log(message.sid));
    }, (eta * 1000 * 60) );
    // res.sendStatus(200);
    res.redirect('/dashboard');
    } );
});

app.post('/notify', (req,res) => {
  const orderID = req.body.id; // Order for customer
  const eta = req.body.eta; // Restaurant's ETA

  knex('order_ticket').join('users','order_ticket.user_id', 'users.unique_id').select('users.name', 'users.phone_num').where("order_ticket.unique_id", Number(orderID)).then( (customer) => {
    // Customer Info & Company Location/Order Link
    const name = customer[0].name;
    const phoneNum = customer[0].phone_num;
    const location = "111 Main Street NW, Calgary, AB, T1Y 1P4";
    const url = 'http://localhost:8080/order/' + orderID;

    // Send initial notification
    client.messages.create({
        body: `Hey ${ name }, Your order has been recieved and will be ready in ${ eta } minutes. For more details regarding your order, check out: ${ url }`,
        to: '+1' + phoneNum,  // Text this number
        from: `+${ process.env.NUM }` // From a valid Twilio number
    })
    .then((message) => console.log(message.sid));
    // Sets a timeout for the order completion text.
    setTimeout( (completed) => {
      client.messages.create({
          body: `Hey ${ name }, Your order is ready for pick up at our location: ${ location }.`,
          to: '+1' + phoneNum,  // Text this number
          from: `+${ process.env.NUM }` // From a valid Twilio number
      })
      .then((message) => console.log(message.sid));
    }, (eta * 1000 * 60) );
    // res.sendStatus(200);
    res.redirect('/dashboard');
    } );
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
