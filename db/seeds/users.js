// Foreigns keys must be set up
exports.seed = function(knex, Promise) {
  knex.schema.hasTable('menu').then ( function (exists) {
    if(exists) {
      return knex('users').del()
        .then(function () {
          Promise.all(
            knex.schema.withSchema('restaurant').createTable('users', function (table) {
              table.increments('unique_id').primary();
              table.string('name', 50);
              table.string('phone_num',11);
              })
            );
        });
      } else {
        return Promise.all(
            knex.schema.withSchema('restaurant').createTable('users', function (table) {
              table.increments('unique_id').primary();
              table.string('name', 50);
              table.string('phone_num',11);
              })
            );
      }
  });
};
