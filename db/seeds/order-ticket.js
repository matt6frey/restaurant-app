// Foreigns keys must be set up
exports.seed = function(knex, Promise) {
  knex.schema.withSchema('restaurant').hasTable('order_ticket').then ( function (exists) {
    if(exists) {
    return knex('order_ticket').del()
      .then(function () {
        Promise.all(
          knex.schema.createTable('order_ticket', function (table) {
            table.increments('unique_id').primary();
            table.integer('user_id');
            table.foreign('user_id').references('unique_id').inTable('users');
            table.timestamp('time_ordered', 20);
            table.integer('total_eta').nullable();
            })
          );
      });
    } else {
      return Promise.all(
          knex.schema.withSchema('restaurant').createTable('order_ticket', function (table) {
            table.increments('unique_id').primary();
            table.integer('user_id');
            table.foreign('user_id').references('unique_id').inTable('users');
            table.timestamp('time_ordered', 20);
            table.integer('total_eta');
            })
          );
    }
  });
};
