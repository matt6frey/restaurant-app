// Foreigns keys must be set up
exports.seed = function(knex, Promise) {
  const menuItems = [
    {
      name: 'Italian Breakfast Brushcetta',
      description: 'Delicious lightly roasted ciabatta topped with ripe tomatoes, red onion, fresh basil, poached eggs and avocado.' ,
      price: 13.50,
      meal_type: 'breakfast',
      eta: 420
    },
    {
      name: 'Eggs Benedict',
      description: 'Lightly roasted ciabatta topped with 2 rashers of bacon, 2 eggs and homemade hollandaise sauce. Served with shredded potatoes.' ,
      price: 11.50,
      meal_type: 'breakfast',
      eta: 500
    },
    {
      name: 'Bacon & Eggs',
      description: '2 eggs any style, 2 rashers of bacon, served with sliced tomatoes, basil and shredded potatoes.' ,
      price: 9.99,
      meal_type: 'breakfast',
      eta: 451
    },
    {
      name: 'Bircher Muesli',
      description: 'Bercher Muesli served with fresh banana, berries, and Greek yogurt.' ,
      price: 12.00,
      meal_type: 'breakfast',
      eta: 300
    },
    {
      name: 'The Birds Special',
      description: '2 eggs any style, roasted sliced Roma tomatoes wrapped in presciutto topped with bocconcini, italian sausage and shredded potatoes.' ,
      price: 13.00,
      meal_type: 'breakfast',
      eta: 550
    },
    {
      name: 'Soup of the Day',
      description: 'Our famous tomato basil soup or the soup of the day and 2 slices of toasted ciabatta.' ,
      price: 6.50,
      meal_type: 'lunch',
      eta: 300
    },
    {
      name: 'Mozzarella & Pomodori Panini',
      description: 'Sliced mozzarella & tomatoes with fresh basil and a drizzle of balsamic vinaigrette on an Italian roll.' ,
      price: 10.00,
      meal_type: 'lunch',
      eta: 360
    },
    {
      name: 'Eggplant Parmigiana Sub',
      description: 'Eggplant with mozzarella cheese & housemade pomodoro sauce on an Italian roll.' ,
      price: 11.50,
      meal_type: 'lunch',
      eta: 360
    },
    {
      name: 'Muffaletta',
      description: 'Salami and rosemary prosciutto cotto with provolone and olive tapenade on focaccia.' ,
      price: 10.99,
      meal_type: 'lunch',
      eta: 420
    },
    {
      name: 'Spaghetti Aglio, Olio & Peperoncino',
      description: 'Lots of garlic sautéed in olive oil and red pepper flakes.' ,
      price: 15.99,
      meal_type: 'dinner',
      eta: 600
    },
    {
      name: 'Capellini Ai Pomodori Freschi',
      description: 'Angel hair pasta with fresh tomatoes, olive oil, garlic & basil.' ,
      price: 14.99,
      meal_type: 'dinner',
      eta: 600
    },
    {
      name: 'Eggplant Parmigiana',
      description: 'Layers of oven grilled eggplant with mozzarella in our housemade pomodoro sauce. Served with pasta.' ,
      price: 16.99,
      meal_type: 'dinner',
      eta: 530
    },
    {
      name: 'Pappardelle Ai Gamberi',
      description: 'Sautéed shrimp in our house-made pesto cream sauce served over wide egg noodles.' ,
      price: 10.99,
      meal_type: 'dinner',
      eta: 600
    }
  ];
  knex.schema.hasTable('menu').then ( function (exists) {
    if(exists) {
    return knex('menu').del()
      .then(function () {
        Promise.all(
          [
          knex.schema.withSchema('restaurant').createTable('menu', function (table) {
            table.increments('unique_id').primary();
            table.string('name',40);
            table.string('description', 255);
            table.decimal('', 4, 2);
            table.string('meal_type', 20);
            table.integer('eta');
          }),
          menuItems.forEach( (item) => {
            knex('users').insert({ name: item.name, description: item.description, price: item.price, meal_type: item.meal_type, eta: item.eta });
          })
          ]
        );
    });
    } else {
      return Promise.all(
          [
          knex.schema.withSchema('restaurant').createTable('menu', function (table) {
            table.increments('unique_id').primary();
            table.string('name',40);
            table.string('description', 255);
            table.decimal('', 4, 2);
            table.string('meal_type', 20);
            table.integer('eta');
          }),
          menuItems.forEach( (item) => {
            knex('users').insert({ name: item.name, description: item.description, price: item.price, meal_type: item.meal_type, eta: item.eta });
          })
          ]
        );
    }
  });
};
