import {CreateProductParams, Product} from "../model/types";
import db, {Pool} from 'pg';
import tx from 'pg-tx';
import Ajv from 'ajv';
import schema from '../functions/createProduct/schema';

export default class ProductService {
  private productsTableName = 'products'
  private stocksTableName = 'stocks'

  private readonly pool: Pool;

  constructor() {
    this.pool = new db.Pool();
  }

  async getProductsList(): Promise<Product[]> {
    const query = `
        SELECT p.*, CAST(p.price AS float), s.count
        FROM ${this.productsTableName} p
                 JOIN ${this.stocksTableName} s ON p.id = s.product_id;
    `;

    let result = null;
    await tx(this.pool, async (db) => {
      result = await db.query(query);
    });

    return result?.rows || null;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const query: db.QueryConfig = {
      text: `
          SELECT p.*, CAST(p.price AS float), s.count
          FROM ${this.productsTableName} p
                   JOIN ${this.stocksTableName} s ON p.id = s.product_id
          WHERE p.id = $1;
      `,
      values: [id],
    }

    let result = null;
    await tx(this.pool, async (db) => {
      result = await db.query(query);
    });

    return result?.rows[0] || null;
  }

  async createProduct(createProductParams: CreateProductParams): Promise<Product> {
    const ajv = new Ajv({coerceTypes: true});
    const validate = ajv.compile(schema);

    if (!validate(createProductParams)) {
      throw new Error('invalid Create Product Params.')
    }

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

    let result = null;
    await tx(this.pool, async (db) => {
      result = await db.query(query);
    });

    return result?.rows[0] || null;
  }
}