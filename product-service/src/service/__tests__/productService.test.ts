import ProductService from '../ProductService';
import {CreateProductParams, Product} from "../../model/types";
import db from 'pg';
// Mock the database client
jest.mock('pg');

jest.mock('../../mocks/mockAsyncAction', () =>
    jest.fn().mockImplementation((data) => Promise.resolve(data))
);

xdescribe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
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
      const mockResponse = {
        rows: expectedResult
      };

      const mockQueryFn = jest.fn().mockResolvedValueOnce(mockResponse);

      const mockPool = {
        connect: () => ({
          query: mockQueryFn,
          release: jest.fn(),
        }),
        query: mockQueryFn,
      };

      // @ts-ignore
      (db.Pool as jest.Mock).mockImplementation(() => mockPool);

      const result = await productService.getProductsList();

      expect(mockQueryFn).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
      expect(mockQueryFn).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return empty array if there are no products', async () => {
      const mockQueryFn = jest.fn().mockResolvedValueOnce({rows: []});

      const mockPool = {
        connect: () => ({
          query: mockQueryFn,
          release: jest.fn(),
        }),
        query: mockQueryFn,
      };
      // @ts-ignore
      (db.Pool as jest.Mock).mockImplementation(() => mockPool);

      const result = await productService.getProductsList();

      expect(result).toEqual([]);
      expect(mockQueryFn).toHaveBeenCalledTimes(1);
      expect(mockQueryFn).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
      }));
    });
  });

  describe('getProductById', () => {
    it('should return a product by ID', async () => {
      const expectedResult = {id: 1, title: 'Product 1', count: 10};
      const mockQueryFn = jest.fn().mockResolvedValueOnce({rows: [expectedResult]})

      const mockPool = {
        connect: () => ({
          query: mockQueryFn,
          release: jest.fn(),
        }),
        query: mockQueryFn,
      };
      // @ts-ignore
      (db.Pool as jest.Mock).mockImplementation(() => mockPool);

      const result = await productService.getProductById('1');

      expect(result).toEqual(expectedResult);
      expect(mockQueryFn).toHaveBeenCalledTimes(1);
      expect(mockQueryFn).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
        values: expect.any(Array),
      }));
    });

    it('should return null if the product does not exist', async () => {
      const mockQueryFn = jest.fn().mockResolvedValueOnce({rows: []})

      const mockPool = {
        connect: () => ({
          query: mockQueryFn,
          release: jest.fn(),
        }),
        query: mockQueryFn,
      };
      // @ts-ignore
      (db.Pool as jest.Mock).mockImplementation(() => mockPool);

      const result = await productService.getProductById('1');

      expect(result).toBeNull();
      expect(mockQueryFn).toHaveBeenCalledTimes(1);
      expect(mockQueryFn).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
        values: expect.any(Array),
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
      const expectedResult = {id: 1, ...createProductParams, count: 5};
      const mockQueryFn = jest.fn().mockResolvedValueOnce({rows: [expectedResult]})

      const mockPool = {
        connect: () => ({
          query: mockQueryFn,
          release: jest.fn(),
        }),
        query: mockQueryFn,
      };
      // @ts-ignore
      (db.Pool as jest.Mock).mockImplementation(() => mockPool);
      const result = await productService.createProduct(createProductParams);

      expect(result).toEqual(expectedResult);
      expect(mockQueryFn).toHaveBeenCalledTimes(1);
      expect(mockQueryFn).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.any(String),
        values: expect.any(Array),
      }));
    });
  });
});
