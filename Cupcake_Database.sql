DROP DATABASE IF EXISTS cupcakeMatcher;

CREATE DATABASE cupcakeMatcher;
USE cupcakeMatcher;

-- 1. User table
CREATE TABLE user (
    userID INT AUTO_INCREMENT,
    uname VARCHAR(100) NOT NULL,
    PRIMARY KEY (userID)
);

-- 2. User flavor profile
CREATE TABLE user_flavor_profile (
    userID INT NOT NULL,
    flavor_profile_number INT NOT NULL,
    PRIMARY KEY (userID, flavor_profile_number),
    FOREIGN KEY (userID) REFERENCES user(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 3. Cupcake
CREATE TABLE cupcake (
    cname VARCHAR(50),
    flavor_profile VARCHAR(50),
    PRIMARY KEY (cname)
);

-- 4. Ingredients
CREATE TABLE ingredients (
    iname VARCHAR(50),
    category VARCHAR(50),
    PRIMARY KEY (iname)
);

-- 5. Allergen
CREATE TABLE allergen (
    iname VARCHAR(50),
    allergen_category VARCHAR(50),
    PRIMARY KEY (iname, allergen_category),
    FOREIGN KEY (iname) REFERENCES ingredients(iname)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 6. Retailer
CREATE TABLE retailer (
    rname VARCHAR(50),
    location VARCHAR(150),
    PRIMARY KEY (rname, location)
);

-- 7. Likes
CREATE TABLE likes (
    userID INT,
    cname VARCHAR(50),
    PRIMARY KEY (userID, cname),
    FOREIGN KEY (userID) REFERENCES user(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cname) REFERENCES cupcake(cname)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 8. Contains
CREATE TABLE contains (
    cname VARCHAR(50),
    iname VARCHAR(50),
    PRIMARY KEY (cname, iname),
    FOREIGN KEY (cname) REFERENCES cupcake(cname)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (iname) REFERENCES ingredients(iname)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 9. Cupcake available at retailer
CREATE TABLE cupcake_available_at (
    cname VARCHAR(50),
    rname VARCHAR(50),
    location VARCHAR(150),
    PRIMARY KEY (cname, rname, location),
    FOREIGN KEY (cname) REFERENCES cupcake(cname)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (rname, location) REFERENCES retailer(rname, location)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 10. Ingredients available at retailer
CREATE TABLE ingredients_available_at (
    iname VARCHAR(50),
    rname VARCHAR(50),
    location VARCHAR(150),
    PRIMARY KEY (iname, rname, location),
    FOREIGN KEY (iname) REFERENCES ingredients(iname)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (rname, location) REFERENCES retailer(rname, location)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);