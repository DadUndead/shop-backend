import {CreateProductParams, Product} from "../model/types";
import Ajv from 'ajv';
import schema from '../functions/createProduct/schema';
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {v4 as uuid} from 'uuid';
import * as AWS from 'aws-sdk';


export default class ProductService {
  private readonly dbClient: DocumentClient;
  private readonly productsTableName = 'products'
  private readonly stocksTableName = 'stocks'

  constructor() {
    this.dbClient = new DocumentClient();
  }

  async getProductsList(): Promise<Product[]> {
    const params: DocumentClient.ScanInput = {
      TableName: this.productsTableName
    };

    const products: Product[] = [];
    const result = await this.dbClient.scan(params).promise();

    for (const item of result.Items) {
      const product: Product = {
        ...item as Omit<Product, 'count'>,
        count: 0
      };
      const stockParams: DocumentClient.GetItemInput = {
        TableName: this.stocksTableName,
        Key: {product_id: item.id}
      };
      const stockResult = await this.dbClient.get(stockParams).promise();

      if (stockResult.Item && 'count' in stockResult.Item) {
        product.count = stockResult.Item.count;
      }

      products.push(product);
    }

    return products;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const params: DocumentClient.GetItemInput = {
      TableName: this.productsTableName,
      Key: {id}
    };

    const productResult = await this.dbClient.get(params).promise();
    if (!productResult.Item) {
      return undefined;
    }

    const product: Product = {
      ...productResult.Item as Omit<Product, 'count'>,
      count: 0
    };

    const stockParams: DocumentClient.GetItemInput = {
      TableName: this.stocksTableName,
      Key: {product_id: id}
    };
    const stockResult = await this.dbClient.get(stockParams).promise();
    if (stockResult.Item && 'count' in stockResult.Item) {
      product.count = stockResult.Item.count;
    }

    return product;
  }

  async createProduct(createProductParams: CreateProductParams): Promise<Product> {
    const ajv = new Ajv({coerceTypes: true});
    const validate = ajv.compile(schema);

    if (!validate(createProductParams)) {
      throw new Error('invalid Create Product Params.')
    }

    const id = uuid();
    const {count, ...restCreateParams} = createProductParams;

    const params: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
      TransactItems: [
        {
          Put: {
            TableName: this.productsTableName,
            Item: {
              id, ...restCreateParams
            },
            ConditionExpression: 'attribute_not_exists(id)'
          }
        },
        {
          Put: {
            TableName: this.stocksTableName,
            Item: {product_id: id, count},
            ConditionExpression: 'attribute_not_exists(product_id)'
          }
        }
      ]
    }

    try {
      await this.dbClient.transactWrite(params).promise();
    } catch (err) {
      console.error(`Error creating product: ${err}`);
      throw err;
    }

    return await this.getProductById(id);
  }
}