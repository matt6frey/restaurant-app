// Foreigns keys must be set up
exports.seed = function(knex, Promise) {
  knex.schema.hasTable('order_list').then( function (exists) {
    if(exists) {
      return knex('order_list').del()
        .then(function () {
          Promise.all(
            knex.schema.withSchema('restaurant').createTable('order_list', function (table) {
              // .foreign('user_id').references('unique_id').inTable('users')
              table.increments('unique_id').primary();
              table.integer('menu_id',40);
              table.foreign('menu_id').references('unique_id').inTable('menu');
              table.integer('order_id', 255);
              table.foreign('order_id').references('unique_id').inTable('order_ticket');
              table.integer('eta');
              })
            );
        });
      } else {
        return Promise.all(
            knex.schema.withSchema('restaurant').createTable('order_list', function (table) {
              // .foreign('user_id').references('unique_id').inTable('users')
              table.increments('unique_id').primary();
              table.integer('menu_id',40);
              table.foreign('menu_id').references('unique_id').inTable('menu');
              table.integer('order_id', 255);
              table.foreign('order_id').references('unique_id').inTable('order_ticket');
              table.integer('eta');
              })
            );
      }
    });
};
