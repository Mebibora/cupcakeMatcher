-- 1. Create and Select the database
CREATE DATABASE IF NOT EXISTS cupcake_db;
USE cupcake_db;

-- 2. CLEANUP STEP: Drop tables in reverse order to respect foreign keys
-- This is what fixes the "Table 'user' already exists" error (1050) for all tables.
DROP TABLE IF EXISTS ingredients_available_at;
DROP TABLE IF EXISTS cupcake_available_at;
DROP TABLE IF EXISTS contains;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS user_flavor_profile;
DROP TABLE IF EXISTS cupcake;
DROP TABLE IF EXISTS allergen;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS retailer;
DROP TABLE IF EXISTS user;

-- 3. Table Creation

CREATE TABLE user (
    userID INT PRIMARY KEY,
    uname VARCHAR(255) NOT NULL
);

CREATE TABLE retailer (
    rname VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    PRIMARY KEY (rname, location)
);

CREATE TABLE ingredients (
    iname VARCHAR(255) PRIMARY KEY,
    category VARCHAR(255)
);

CREATE TABLE allergen (
    iname VARCHAR(255),
    allergen_category VARCHAR(255) NOT NULL,
    PRIMARY KEY (iname, allergen_category),
    FOREIGN KEY (iname) REFERENCES ingredients(iname)
);

CREATE TABLE cupcake (
    cname VARCHAR(255) PRIMARY KEY,
    flavor_profile VARCHAR(255)
);

CREATE TABLE user_flavor_profile (
    userID INT,
    flavor_profile_number INT,
    PRIMARY KEY (userID, flavor_profile_number),
    FOREIGN KEY (userID) REFERENCES user(userID)
);

CREATE TABLE likes (
    userID INT,
    cname VARCHAR(255),
    PRIMARY KEY (userID, cname),
    FOREIGN KEY (userID) REFERENCES user(userID),
    FOREIGN KEY (cname) REFERENCES cupcake(cname)
);

CREATE TABLE contains (
    cname VARCHAR(255),
    iname VARCHAR(255),
    PRIMARY KEY (cname, iname),
    FOREIGN KEY (cname) REFERENCES cupcake(cname),
    FOREIGN KEY (iname) REFERENCES ingredients(iname)
);

CREATE TABLE cupcake_available_at (
    cname VARCHAR(255),
    rname VARCHAR(255),
    location VARCHAR(255),
    PRIMARY KEY (cname, rname, location),
    FOREIGN KEY (cname) REFERENCES cupcake(cname),
    FOREIGN KEY (rname, location) REFERENCES retailer(rname, location)
);

CREATE TABLE ingredients_available_at (
    iname VARCHAR(255),
    rname VARCHAR(255),
    location VARCHAR(255),
    PRIMARY KEY (iname, rname, location),
    FOREIGN KEY (iname) REFERENCES ingredients(iname),
    FOREIGN KEY (rname, location) REFERENCES retailer(rname, location)
);