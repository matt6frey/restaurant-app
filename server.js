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

const renderItemContainer = require('./public/scripts/app.js')

const SID         = process.env.SID;
const AUTH        = process.env.AUTH;
const twilio      = require('twilio');
const client = new twilio(SID, AUTH);

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
//notify -twilio
app.get('/notify', (req,res) => {
  const orderId = req.params.id; // Order for customer
  // needs orderid, time
  // get name and number from users
  // query SQL

  // knex('order_list').join('menu','order_list.menu_id', 'menu.unique_id').select('order_list.order_id', 'menu.unique_id', 'name', 'description', 'price').then( (allOrders) => {

  let name = 'Jonny Boy';
  let time = '12';
  let url = 'http://not.real.com/';
  client.messages.create({
      body: `Hey ${ name }, Your order has been recieved and will be ready in ${ time } minutes. For more details regarding your order, check out: ${ url }`,
      // body: `Hey, Your order has been recieved and will be ready in ${ time } minutes. For more details regarding your order, check out: ${ url }`,
      to: '+14038058338',  // Text this number
      from: `+${ process.env.NUM }` // From a valid Twilio number
  })
  .then((message) => console.log(message.sid),console.log('test'));
  res.status(200).send("Attempt\n\n" + message);
});
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
});

// Route for user order
app.get('/order/:id', (req,res) => {
 const orderID = req.params.id;

 let finalArray = [];
 knex('order_list').join('menu','order_list.menu_id', 'menu.unique_id').join('order_ticket','order_list.order_id', 'order_ticket.unique_id').select('order_list.order_id', 'menu.unique_id', 'name', 'description', 'price', 'time_ordered').where('order_list.order_id', '=', `${orderID}`).then( (allOrders) => {
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
    res.render("order", vars);

  });
});


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
