exports.up = function(knex, Promise) {
return knex.schema.createTable('order_ticket', function (table) {
            table.increments('unique_id').primary();
            table.integer('user_id');
            table.foreign('user_id').references('unique_id').inTable('users');
            table.timestamp('time_ordered', 20);
            table.integer('total_eta').nullable();
            });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('order_ticket');
};