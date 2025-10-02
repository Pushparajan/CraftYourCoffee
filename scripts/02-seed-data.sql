-- Seed data for CraftYourCoffee app

-- Insert bases
INSERT INTO bases (name, description, is_active) VALUES
  ('Coffee', 'Classic espresso-based drinks', true),
  ('Tea', 'Hot or iced tea varieties', true),
  ('Refresher', 'Fruit-based refreshing drinks', true),
  ('Frappuccino', 'Blended ice beverages', true),
  ('Hot Chocolate', 'Rich chocolate drinks', true)
ON CONFLICT DO NOTHING;

-- Insert sizes
INSERT INTO sizes (name, volume_ml) VALUES
  ('Short', 236),
  ('Tall', 355),
  ('Grande', 473),
  ('Venti', 591),
  ('Trenta', 887)
ON CONFLICT DO NOTHING;

-- Insert milks
INSERT INTO milks (name, is_dairy_free) VALUES
  ('Whole Milk', false),
  ('2% Milk', false),
  ('Nonfat Milk', false),
  ('Oat Milk', true),
  ('Almond Milk', true),
  ('Soy Milk', true),
  ('Coconut Milk', true),
  ('Heavy Cream', false)
ON CONFLICT DO NOTHING;

-- Insert syrups
INSERT INTO syrups (name, is_seasonal) VALUES
  ('Vanilla', false),
  ('Caramel', false),
  ('Hazelnut', false),
  ('Mocha', false),
  ('White Mocha', false),
  ('Pumpkin Spice', true),
  ('Peppermint', true),
  ('Toffee Nut', false),
  ('Cinnamon Dolce', false),
  ('Brown Sugar', false),
  ('Raspberry', false),
  ('Classic', false)
ON CONFLICT DO NOTHING;

-- Insert toppings
INSERT INTO toppings (name, type) VALUES
  ('Whipped Cream', 'cream'),
  ('Cold Foam', 'foam'),
  ('Sweet Cream Foam', 'foam'),
  ('Caramel Drizzle', 'drizzle'),
  ('Mocha Drizzle', 'drizzle'),
  ('Cinnamon Powder', 'powder'),
  ('Cocoa Powder', 'powder'),
  ('Cookie Crumbles', 'topping'),
  ('Chocolate Chips', 'topping'),
  ('Caramel Crunch', 'topping')
ON CONFLICT DO NOTHING;

-- Insert temperatures
INSERT INTO temperatures (name) VALUES
  ('Hot'),
  ('Iced'),
  ('Blended')
ON CONFLICT DO NOTHING;
