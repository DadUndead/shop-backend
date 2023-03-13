import productsService from "../../../service";
import {formatErrorResponse, formatSuccessResponse} from "@libs/api-gateway";
import {getProductsById} from "@functions/getProductsById/handler";
import productMock from '../../../mocks/product.mock.json'

jest.mock('../../../service', () => ({
  __esModule: true,
  default: {
    getProductById: jest.fn(),
  },
}));

describe('getProductsById lambda', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 200 with the product', async () => {
    const productId = '123';
    const item = {...productMock, id: productId};
    const event = {pathParameters: {productId}} as any;

    (productsService.getProductById as jest.Mock).mockResolvedValueOnce(item);

    const result = await getProductsById(event, null, null);

    expect(productsService.getProductById).toHaveBeenCalledTimes(1);
    expect(productsService.getProductById).toHaveBeenCalledWith(productId);
    expect(result).toEqual(formatSuccessResponse(item));
  });

  it('should return 404 when item is not found', async () => {
    const productId = '123';
    const event = {pathParameters: {productId}} as any;

    (productsService.getProductById as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await getProductsById(event, null, null);

    expect(productsService.getProductById).toHaveBeenCalledTimes(1);
    expect(productsService.getProductById).toHaveBeenCalledWith(productId);
    expect(result).toEqual(formatErrorResponse({name: 'Error', message: 'Product not found'}, 404));
  });

  it('should return 500 when an error occurs', async () => {
    const productId = '123';
    const event = {pathParameters: {productId}} as any;
    const error = new Error('Internal Server Error');

    (productsService.getProductById as jest.Mock).mockRejectedValueOnce(error);

    const result = await getProductsById(event, null, null);

    expect(productsService.getProductById).toHaveBeenCalledTimes(1);
    expect(productsService.getProductById).toHaveBeenCalledWith(productId);
    expect(result).toEqual(formatErrorResponse(error));
  });
});
