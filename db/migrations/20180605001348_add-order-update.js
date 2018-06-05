exports.up = function(knex, Promise) {
return knex.schema.table('order_ticket', function (table) {
              table.boolean('update').nullable();
            });
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('order_ticket', function(table){
      table.dropColumn('update');
    })
  ]);
};
