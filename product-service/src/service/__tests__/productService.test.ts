import ProductService from '../ProductService';
import db from 'pg';
import {CreateProductParams, Product} from "../../model/types";
jest.mock('pg', () => {
  const mockClient = {
    query: jest.fn(),
  };
  return {
    Client: jest.fn(() => mockClient),
  };
});

jest.mock('../../mocks/mockAsyncAction', () =>
    jest.fn().mockImplementation((data) => Promise.resolve(data))
);

describe('ProductService', () => {
  let productService: ProductService;
  let dbClient: db.Client;

  beforeEach(() => {
    dbClient = new db.Client();
    productService = new ProductService(dbClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductsList', () => {
    it('should return a list of products', async () => {
      const expectedResult: Product[] = [{
        id: "1",
        title: "Fender Stratocaster",
        price: 999.99,
        description: "A classic electric guitar used by countless legendary musicians.",
        image_url: "https://source.unsplash.com/collection/10260627/480x480?1",
        count: 10,
      }];
      (dbClient.query as jest.Mock).mockResolvedValueOnce({ rows: expectedResult });

      const result = await productService.getProductsList();

      expect(result).toEqual(expectedResult);
      expect(dbClient.query).toHaveBeenCalledTimes(1);
      expect(dbClient.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
      }));
    });

    it('should return null if there are no products', async () => {
      (dbClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await productService.getProductsList();

      expect(result).toEqual([]);
      expect(dbClient.query).toHaveBeenCalledTimes(1);
      expect(dbClient.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
      }));
    });
  });

  describe('getProductById', () => {
    it('should return a product by ID', async () => {
      const expectedResult = { id: 1, title: 'Product 1', count: 10 };
      (dbClient.query as jest.Mock).mockResolvedValueOnce({ rows: [expectedResult] });

      const result = await productService.getProductById('1');

      expect(result).toEqual(expectedResult);
      expect(dbClient.query).toHaveBeenCalledTimes(1);
      expect(dbClient.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
        values: ['1'],
      }));
    });

    it('should return null if the product does not exist', async () => {
      (dbClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await productService.getProductById('1');

      expect(result).toBeNull();
      expect(dbClient.query).toHaveBeenCalledTimes(1);
      expect(dbClient.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
        values: ['1'],
      }));
    });
  });

  describe('createProduct', () => {
    const createProductParams: CreateProductParams = {
      title: 'New Product',
      description: 'A new product',
      price: 9.99,
      image_url: 'https://example.com/new-product.jpg',
      count: 5,
    };

    it('should create a new product and return it', async () => {
      const expectedResult = { id: 1, ...createProductParams, count: 5 };
      (dbClient.query as jest.Mock).mockResolvedValueOnce({ rows: [expectedResult] });

      const result = await productService.createProduct(createProductParams);

      expect(result).toEqual(expectedResult);
      expect(dbClient.query).toHaveBeenCalledTimes(1);
      expect(dbClient.query).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
        values: [
          createProductParams.title,
          createProductParams.description,
          createProductParams.price,
          createProductParams.image_url,
          createProductParams.count,
        ],
      }));
    });
  });
});
