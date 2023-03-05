'use strict'
import db from 'pg';
import productsListMock from '../src/mocks/productsList.mock.json';

const dbClient = new db.Client();
dbClient.connect();

module.exports.up = function (next) {
    const query = {
        text: `
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            CREATE TABLE IF NOT EXISTS products (
                id UUID DEFAULT uuid_generate_v4 (),
                title TEXT,
                description TEXT,
                price INT,
                image_url TEXT,
                count INT
            );
            INSERT INTO products (title, description, price, image_url, count)
            VALUES ${productsListMock
            .map(item => `(${item.title}, ${item.description}, ${item.price}, ${item.image_url}, ${item.count})`)}
        `
    }
    dbClient.query(query)
        .then(() => next());
}

module.exports.down = function (next) {
    dbClient.query(`DROP TABLE products`)
        .then(() => next())
}
