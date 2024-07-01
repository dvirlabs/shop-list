-- init.sql

-- Create the products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    buy BOOLEAN NOT NULL,
    note TEXT
);

-- Grant all privileges on the database to shop_user
GRANT ALL PRIVILEGES ON DATABASE shop_list TO shop_user;

-- Grant all privileges on the products table to shop_user
GRANT ALL PRIVILEGES ON TABLE products TO shop_user;

-- Ensure shop_user will have all privileges on future tables as well
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO shop_user;
