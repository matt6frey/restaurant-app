exports.up = function(knex, Promise) {
  return knex.schema.createTable('order_list', function (table) {
    // .foreign('user_id').references('unique_id').inTable('users')
    table.increments('unique_id').primary();
    table.integer('menu_id',40);
    table.foreign('menu_id').references('unique_id').inTable('menu');
    table.integer('order_id', 255);
    table.foreign('order_id').references('unique_id').inTable('order_list');
    table.integer('eta');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('order_list');
};
