import ProductService from '../ProductService';
import productsListMock from '../../mocks/productsList.mock.json';

jest.mock('../../mocks/mockAsyncAction', () =>
    jest.fn().mockImplementation((data) => Promise.resolve(data))
);

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
  });

  describe('getProductsList', () => {
    it('should return a list of products', async () => {
      const result = await productService.getProductsList();
      expect(result).toEqual(productsListMock);
    });
  });

  describe('getProduct', () => {
    it('should return a product for a valid id', async () => {
      const productId = '1';
      const expectedProduct = productsListMock.find((product) => product.id===productId);
      const result = await productService.getProductById(productId);
      expect(result).toEqual(expectedProduct);
    });

    it('should return undefined for an invalid id', async () => {
      const productId = '100';
      const result = await productService.getProductById(productId);
      expect(result).toBeUndefined();
    });
  });
});
