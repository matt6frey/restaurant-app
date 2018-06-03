
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments('unique_id').primary();
    table.string('name', 50);
    table.string('phone_num',11);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
