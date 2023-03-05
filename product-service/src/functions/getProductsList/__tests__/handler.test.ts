import productsService from "../../../service";
import {formatErrorResponse, formatSuccessResponse} from "@libs/api-gateway";
import {getProductsList} from "@functions/getProductsList/handler";
import productsListMock from '../../../mocks/productsList.mock.json'

jest.mock('../../../service', () => ({
  __esModule: true,
  default: {
    getProductsList: jest.fn(),
  },
}));

describe('getProductsList lambda', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 200 with the products list', async () => {
    const items = productsListMock;
    const event = {} as any;

    (productsService.getProductsList as jest.Mock).mockResolvedValueOnce(items);

    const result = await getProductsList(event, null, null);

    expect(productsService.getProductsList).toHaveBeenCalledTimes(1);
    expect(result).toEqual(formatSuccessResponse(items));
  });

  it('should return 500 when an error occurs', async () => {
    const event = {} as any;
    const error = new Error('Internal Server Error');

    (productsService.getProductsList as jest.Mock).mockRejectedValueOnce(error);

    const result = await getProductsList(event, null, null);

    expect(productsService.getProductsList).toHaveBeenCalledTimes(1);
    expect(result).toEqual(formatErrorResponse(error));
  });
});
