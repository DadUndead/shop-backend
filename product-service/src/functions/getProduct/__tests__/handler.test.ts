import productsService from "../../../service";
import {formatJSONResponse} from "@libs/api-gateway";
import {getProduct} from "@functions/getProduct/handler";
import productMock from '../../../mocks/product.mock.json'

jest.mock('../../../service', () => ({
  __esModule: true,
  default: {
    getProduct: jest.fn(),
  },
}));

describe('getProduct lambda', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 200 with the product', async () => {
    const productId = '123';
    const item = {...productMock, id: productId};
    const event = {pathParameters: {productId}} as any;

    (productsService.getProduct as jest.Mock).mockResolvedValueOnce(item);

    const result = await getProduct(event, null, null);

    expect(productsService.getProduct).toHaveBeenCalledTimes(1);
    expect(productsService.getProduct).toHaveBeenCalledWith(productId);
    expect(result).toEqual(formatJSONResponse(200, item));
  });

  it('should return 404 when item is not found', async () => {
    const productId = '123';
    const event = {pathParameters: {productId}} as any;

    (productsService.getProduct as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await getProduct(event, null, null);

    expect(productsService.getProduct).toHaveBeenCalledTimes(1);
    expect(productsService.getProduct).toHaveBeenCalledWith(productId);
    expect(result).toEqual(formatJSONResponse(404, undefined));
  });

  it('should return 500 when an error occurs', async () => {
    const productId = '123';
    const event = {pathParameters: {productId}} as any;
    const error = new Error('Internal Server Error');

    (productsService.getProduct as jest.Mock).mockRejectedValueOnce(error);

    const result = await getProduct(event, null, null);

    expect(productsService.getProduct).toHaveBeenCalledTimes(1);
    expect(productsService.getProduct).toHaveBeenCalledWith(productId);
    expect(result).toEqual(formatJSONResponse(500, error));
  });
});
