'use strict'

const db = require('pg');
const dbClient = new db.Client();

module.exports.up = async () => {
    await dbClient.connect()

    const products = await dbClient.query(`
        SELECT *
        FROM products
    `);

    const values = products.rows.map(row => `('${row.id}', 10)`).join(', ');

    await dbClient
        .query(`
            CREATE TABLE IF NOT EXISTS stocks
            (
                product_id UUID,
                count      INT
            );
            INSERT INTO stocks(product_id, count)
            VALUES
            ${values};
        `)
        .then(result => console.log('Stocks created'))

    await dbClient.end();
}

module.exports.down = async () => {
    await dbClient.connect()

    await dbClient.query(`DROP TABLE stocks`)
    await dbClient.end();
}
