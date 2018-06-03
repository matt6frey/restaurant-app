
exports.up = function(knex, Promise) {
  return  knex.schema.createTable('menu', function (table) {
            table.increments('unique_id').primary();
            table.string('name',40);
            table.string('description', 255);
            table.decimal('price', 4, 2);
            table.string('meal_type', 20);
            table.integer('eta');
          });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('menu');
};
