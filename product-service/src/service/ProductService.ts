import {CreateProductParams, Product} from "../model/types";
import db from 'pg';

export default class ProductService {
  private tableName = 'products'

  constructor(private dbClient: db.Client) {
  }

  async getProductsList(): Promise<Product[]> {
    const query: db.QueryConfig = {
      text: `SELECT *
             FROM $1`,
      values: [this.tableName],
    }

    const result = await this.dbClient.query(query);
    return result.rows || null;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const query: db.QueryConfig = {
      text: `SELECT *
             FROM $1
             WHERE id = $2`,
      values: [this.tableName, id],
    }

    const result = await this.dbClient.query(query);
    return result.rows[0] || null;
  }

  async createProduct(createProductParams: CreateProductParams): Promise<Product> {

    const query = {
      text: `INSERT INTO ${this.tableName}(title, description, price, logo, count)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
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