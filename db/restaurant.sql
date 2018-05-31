--- Restaurant Schema

CREATE SCHEMA IF NOT EXISTS restaurant AUTHORIZATION labber;

CREATE TABLE IF NOT EXISTS users (
    unique_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    phone_num VARCHAR(11) --- Incase company goes internalional
);

CREATE TABLE IF NOT EXISTS order_ticket (
    unique_id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    time_ordered TIMESTAMP, --- Incase company goes internalional
    total_ETA INTEGER DEFAULT NULL --- in seconds
);

CREATE TABLE IF NOT EXISTS menu (
    unique_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255),
    price DECIMAL(4,2), --- Incase company goes internalional
    meal_type VARCHAR(25),
    ETA INTEGER --- in seconds
);

CREATE TABLE IF NOT EXISTS order_list (
    unique_id BIGSERIAL PRIMARY KEY,
    meni_id INTEGER,
    order_id INTEGER,
    ETA INTEGER --- in seconds
);

INSERT INTO menu VALUES (1, 'Italian Breakfast Brushcetta', 'Delicious lightly roasted ciabatta topped with ripe tomatoes, red onion, fresh basil, poached eggs and avocado.', 13.50, 'breakfast', 420);
INSERT INTO menu VALUES (2, 'Eggs Benedict', 'Lightly roasted ciabatta topped with 2 rashers of bacon, 2 eggs and homemade hollandaise sauce. Served with shredded potatoes.', 11.50, 'breakfast',500);
INSERT INTO menu VALUES (3, 'Bacon & Eggs', '2 eggs any style, 2 rashers of bacon, served with sliced tomatoes, basil and shredded potatoes.', 9.99, 'breakfast', 450 );
INSERT INTO menu VALUES (4, 'Bircher Muesli', 'Bercher Muesli served with fresh banana, berries, and Greek yogurt.', 12.0, 'breakfast', 300 );
INSERT INTO menu VALUES (5, 'The Birds Special', '2 eggs any style, roasted sliced Roma tomatoes wrapped in presciutto topped with bocconcini, italian sausage and shredded potatoes.', 13.00, 'breakfast', 550 );
--- Lunch
INSERT INTO menu VALUES (6, 'Soup of the Day', 'Our famous tomato basil soup or the soup of the day and 2 slices of toasted ciabatta.', 6.50, 'lunch', 300 );
INSERT INTO menu VALUES (7, 'Mozzarella & Pomodori Panini', 'Sliced mozzarella & tomatoes with fresh basil and a drizzle of balsamic vinaigrette on an Italian roll.', 10.00, 'lunch', 360 );
INSERT INTO menu VALUES (8, 'Eggplant Parmigiana Sub', 'Eggplant with mozzarella cheese & housemade pomodoro sauce on an Italian roll.', 11.50, 'lunch', 360 );
INSERT INTO menu VALUES (9, 'Muffaletta', 'Salami and rosemary prosciutto cotto with provolone and olive tapenade on focaccia.', 10.99, 'lunch', 420 );
--- Dinner
INSERT INTO menu VALUES (10, 'Spaghetti Aglio, Olio & Peperoncino', 'Lots of garlic sautéed in olive oil and red pepper flakes.', 15.99, 'dinner', 600 );
INSERT INTO menu VALUES (11, 'Capellini Ai Pomodori Freschi', 'Angel hair pasta with fresh tomatoes, olive oil, garlic & basil.', 14.99, 'dinner', 600 );
INSERT INTO menu VALUES (12, 'Eggplant Parmigiana', 'Layers of oven grilled eggplant with mozzarella in our housemade pomodoro sauce. Served with pasta.', 16.99, 'dinner', 530 );
INSERT INTO menu VALUES (13, 'Pappardelle Ai Gamberi', 'Sautéed shrimp in our house-made pesto cream sauce served over wide egg noodles.', 10.99, 'dinner', 600);