-- Ready-to-run schema and seed data for cupcakeMatcher

-- Create database (safe to rerun)
CREATE DATABASE IF NOT EXISTS cupcakeMatcher;
USE cupcakeMatcher;

-- Drop existing tables to allow clean reseed
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS cupcake_available_at;
DROP TABLE IF EXISTS cupcake;
DROP TABLE IF EXISTS retailer;
SET FOREIGN_KEY_CHECKS = 1;

-- Retailers
CREATE TABLE retailer (
  retailerID INT AUTO_INCREMENT PRIMARY KEY,
  rname VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cupcakes
CREATE TABLE cupcake (
  cupcakeID INT AUTO_INCREMENT PRIMARY KEY,
  cname VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Availability join
CREATE TABLE cupcake_available_at (
  cupcakeID INT NOT NULL,
  retailerID INT NOT NULL,
  PRIMARY KEY (cupcakeID, retailerID),
  CONSTRAINT fk_cupcake FOREIGN KEY (cupcakeID) REFERENCES cupcake(cupcakeID) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_retailer FOREIGN KEY (retailerID) REFERENCES retailer(retailerID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed retailers (Atlanta area)
INSERT INTO retailer (rname, location) VALUES
('Sweet Tooth Bakery', 'Atlanta, GA'),
('Cupcake Heaven', 'Decatur, GA'),
('Frosted Bliss', 'Marietta, GA'),
('Peachy Creamery', 'Midtown Atlanta, GA'),
('Sugar & Spice', 'Buckhead, GA');

-- Seed cupcakes for all quiz outcomes

-- Basic Vanilla
INSERT INTO cupcake (cname) VALUES
('Classic Vanilla'),
('Ultimate Birthday'),
('Vanilla Bean'),
('Vanilla Bean White Velvet'),
('Yellow with Chocolate Buttercream'),
('Yellow with Milk Chocolate Frosting');

-- Nutty
INSERT INTO cupcake (cname) VALUES
('Almond Joy'),
('Coconut Macaroon'),
('Italian Cream'),
('Hummingbird'),
('Coconut Nutella'),
('Mocha Nutella');

-- Fruity
INSERT INTO cupcake (cname) VALUES
('Strawberry Shortcake'),
('Berry Bliss'),
('Lemon Zest'),
('Lemon Raspberry');

-- Spiced
INSERT INTO cupcake (cname) VALUES
('Pumpkin Spice'),
('Chai Latte'),
('Carrot Cake'),
('Ginger Snap');

-- Coffee/Drink
INSERT INTO cupcake (cname) VALUES
('Mocha Delight'),
('Caramel Macchiato'),
('Irish Coffee'),
('Tiramisu Cupcake');

-- Map cupcakes to retailers (at least one mapping each)

-- Helper view-free inserts: find IDs by name via subqueries
INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Classic Vanilla' AND r.rname IN ('Sweet Tooth Bakery', 'Sugar & Spice');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Ultimate Birthday' AND r.rname IN ('Cupcake Heaven', 'Peachy Creamery');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Vanilla Bean' AND r.rname IN ('Frosted Bliss', 'Sweet Tooth Bakery');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Vanilla Bean White Velvet' AND r.rname IN ('Sugar & Spice');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Yellow with Chocolate Buttercream' AND r.rname IN ('Peachy Creamery', 'Frosted Bliss');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Yellow with Milk Chocolate Frosting' AND r.rname IN ('Cupcake Heaven');

-- Nutty
INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Almond Joy' AND r.rname IN ('Sugar & Spice', 'Frosted Bliss');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Coconut Macaroon' AND r.rname IN ('Sweet Tooth Bakery', 'Cupcake Heaven');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Italian Cream' AND r.rname IN ('Peachy Creamery');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Hummingbird' AND r.rname IN ('Frosted Bliss', 'Sugar & Spice');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Coconut Nutella' AND r.rname IN ('Cupcake Heaven');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Mocha Nutella' AND r.rname IN ('Peachy Creamery', 'Sweet Tooth Bakery');

-- Fruity
INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Strawberry Shortcake' AND r.rname IN ('Cupcake Heaven', 'Sugar & Spice');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Berry Bliss' AND r.rname IN ('Frosted Bliss');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Lemon Zest' AND r.rname IN ('Sweet Tooth Bakery', 'Peachy Creamery');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Lemon Raspberry' AND r.rname IN ('Sugar & Spice');

-- Spiced
INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Pumpkin Spice' AND r.rname IN ('Sweet Tooth Bakery', 'Frosted Bliss');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Chai Latte' AND r.rname IN ('Cupcake Heaven');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Carrot Cake' AND r.rname IN ('Peachy Creamery', 'Sugar & Spice');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Ginger Snap' AND r.rname IN ('Frosted Bliss');

-- Coffee/Drink
INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Mocha Delight' AND r.rname IN ('Peachy Creamery', 'Sweet Tooth Bakery');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Caramel Macchiato' AND r.rname IN ('Cupcake Heaven', 'Sugar & Spice');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Irish Coffee' AND r.rname IN ('Peachy Creamery');

INSERT INTO cupcake_available_at (cupcakeID, retailerID)
SELECT c.cupcakeID, r.retailerID FROM cupcake c, retailer r
WHERE c.cname = 'Tiramisu Cupcake' AND r.rname IN ('Frosted Bliss', 'Sugar & Spice');
