'use strict'
const productsListMock = require('../src/mocks/productsList.mock.json');
const {v4: uuidv4} = require('uuid');
const AWS = require("aws-sdk");
const dbClient = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
const db = new AWS.DynamoDB({region: 'eu-west-1'});

async function checkTableExists(tableName) {
    try {
        await db.describeTable({TableName: tableName}).promise();
        return true;
    } catch (error) {
        if (error.code === 'ResourceNotFoundException') {
            return false;
        } else {
            throw error;
        }
    }
}

module.exports.up = async function (next) {
    const productsTableExists = await checkTableExists('products');
    const stocksTableExists = await checkTableExists('stocks');
    if (!productsTableExists) {
        const tableParams = {
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S'
                }
            ],
            KeySchema: [
                {
                    AttributeName: 'id',
                    KeyType: 'HASH'
                }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            TableName: 'products'
        };

        await db.createTable(tableParams).promise();
        console.log('Products table created');
    }
    if (!stocksTableExists) {
        const tableParams = {
            AttributeDefinitions: [
                {
                    AttributeName: 'product_id',
                    AttributeType: 'S'
                }
            ],
            KeySchema: [
                {
                    AttributeName: 'product_id',
                    KeyType: 'HASH'
                }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            TableName: 'stocks'
        };

        await db.createTable(tableParams).promise();
        console.log('Stocks table created');
    }

    console.log('Tables are ready');
    console.log('Preparing items...');

    const transactItems = productsListMock
        .map(item => ({
            id: uuidv4(),
            title: item.title,
            description: item.description,
            price: item.price,
            image_url: item.image_url,
            count: item.count,
        }))
        .reduce((accum, val, index, arr) => {
            const {count, ...rest} = val;
            const putProduct = {
                Put: {
                    TableName: 'products',
                    Item: {...rest},
                    ConditionExpression: 'attribute_not_exists(id)'
                }
            }
            const putStock = {
                Put: {
                    TableName: 'stocks',
                    Item: {product_id: val.id, count},
                    ConditionExpression: 'attribute_not_exists(product_id)'
                }
            }

            return accum.concat([putProduct, putStock])
        }, []);

    const params = {
        TransactItems: transactItems
    }

    try {
        await dbClient.transactWrite(params).promise();

        console.log('Items are successfully put into tables!');
    } catch (err) {
        console.error(`Error creating items: ${err}`);
        throw err;
    }
}

module.exports.down = async function (next) {
    const productsTableExists = await checkTableExists('products');
    const stocksTableExists = await checkTableExists('stocks');
    if (productsTableExists) {
        await db.deleteTable({TableName: 'products'}).promise();
    }
    if (stocksTableExists) {
        await db.deleteTable({TableName: 'stocks'}).promise();
    }
}
