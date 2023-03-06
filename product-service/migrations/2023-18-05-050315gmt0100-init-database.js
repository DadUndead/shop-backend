'use strict'
const db = require('pg');
const productsListMock = require('../src/mocks/productsList.mock.json');
const dbClient = new db.Client();

module.exports.up = async function (next) {
    await dbClient.connect();

    const values = productsListMock
        .map(item => `('${item.title}', '${item.description}', ${item.price}, '${item.image_url}')`)
        .join(', ')

    await dbClient.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await dbClient
        .query(`
            CREATE TABLE IF NOT EXISTS products
            (
                id          UUID DEFAULT uuid_generate_v4(),
                title       TEXT,
                description TEXT,
                price       NUMERIC(10, 2),
                image_url   TEXT
            );
            INSERT INTO products (title, description, price, image_url)
            VALUES ${values};
        `)
        .then(result => console.log('Products table created'))

    await dbClient.end();
}

module.exports.down = async function (next) {
    await dbClient.connect();

    await dbClient.query(`DROP TABLE products`)
    await dbClient.end();
}
