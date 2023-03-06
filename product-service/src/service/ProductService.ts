import {CreateProductParams, Product} from "../model/types";
import db from 'pg';

export default class ProductService {
  private productsTableName = 'products'
  private stocksTableName = 'stocks'

  constructor(private dbClient: db.Client) {
  }

  async getProductsList(): Promise<Product[]> {
    const query: db.QueryConfig = {
      text: `
          SELECT p.*, s.count
          FROM ${this.productsTableName} p
                   JOIN ${this.stocksTableName} s ON p.id = s.product_id;
      `,
    }

    const result = await this.dbClient.query(query);
    return result.rows || null;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const query: db.QueryConfig = {
      text: `
          SELECT p.*, s.count
          FROM ${this.productsTableName} p
                   JOIN ${this.stocksTableName} s ON p.id = s.product_id
          WHERE p.id = $1;
      `,
      values: [id],
    }

    const result = await this.dbClient.query(query);
    return result.rows[0] || null;
  }

  async createProduct(createProductParams: CreateProductParams): Promise<Product> {

    const query = {
      text: `
          WITH inserted_product AS (
              -- Insert a new product into the "products" table and get its ID
              INSERT INTO ${this.productsTableName} (title, description, price, image_url)
                  VALUES ($1, $2, $3, $4)
                  RETURNING *),
               inserted_stock AS (
                   INSERT INTO ${this.stocksTableName} (product_id, count)
                       SELECT id, $5
                       FROM inserted_product
                       RETURNING count, product_id)
          SELECT p.*,
                 CAST(p.price AS float),
                 s.count
          FROM inserted_product p
                   JOIN inserted_stock s ON p.id = s.product_id;
      `,
      values: [
        createProductParams.title,
        createProductParams.description,
        createProductParams.price,
        createProductParams.image_url,
        createProductParams.count
      ],
    };

    const result = await this.dbClient.query(query);
    return result.rows[0] || null;
  }
}