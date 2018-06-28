# Restaurant-app

Restaurant-app is a pick up ordering service that allows for SMS communication to customer on order ready.

This app has 3 main pages:
1. A home page which displays the restaurant's menu and allows users to place and check on orders
2. A order page which allows users to check on their order details
3. A dashboard page which allows owners to notify customers of time of order completion and check on pending and completed orders

It is built using HTML, SASS, JS, jQuery and AJAX front-end skills, and Express and PostgreSQL back-end skills.

## Final Product

Home Page
!["Screenshot of home page"](https://github.com/moeenah/Restaurant-app/blob/master/docs/home_page.png)
Message on successful order
!["Screenshot of successful order message"](https://github.com/moeenah/Restaurant-app/blob/master/docs/ordered_success.png)
Customer's order details
!["Screenshot of sample customer's order details"](https://github.com/moeenah/Restaurant-app/blob/master/docs/order_page.png)
Owner's dashboard
!["Screenshot of sample owner's dashboard page"](https://github.com/moeenah/Restaurant-app/blob/master/docs/dashboard_page.png)

## Getting Started

1. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`
2. Update the .env file with your correct local information
3. Install dependencies: `npm i`
4. Fix to binaries for sass: `npm rebuild node-sass`
5. Run migrations: `npm run knex migrate:latest`
  - Check the migrations folder to see what gets created in the DB
6. Run the seed: `npm run knex seed:run`
  - Check the seeds file to see what gets seeded in the DB
7. Run the server: `npm run local`
8. Visit `http://localhost:8080/`

## Dependencies

- Express
- Node
- NPM
- Body-parser
- Chance
- MD5
- Mongodb
- Bcryptjs
- Dotenv
- EJS
- Knex
- Knex-logger
- Minimist
- Moment
- Moment-timezone
- Morgan
- Pg
- Sass
- Twilio
