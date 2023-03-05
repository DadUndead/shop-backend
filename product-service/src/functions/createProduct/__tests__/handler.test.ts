import productsService from "../../../service";
import {createProduct} from "@functions/createProduct/handler";
import {CreateProductParams} from "../../../model/types";
import {formatErrorResponse, formatSuccessResponse} from "@libs/api-gateway";

jest.mock('../../../service', () => ({
  __esModule: true,
  default: {
    createProduct: jest.fn(),
  },
}));

let mockItemRequestBody: CreateProductParams = {
  title: "Fender Stratocaster",
  price: 999.99,
  description: "A classic electric guitar used by countless legendary musicians.",
  count: 10,
  image_url: '',
};

describe('createProduct lambda', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create a product and return a success response', async () => {
    const body = mockItemRequestBody;
    const mockResponse = {id: '123', ...body};
    (productsService.createProduct as jest.Mock).mockResolvedValueOnce(mockResponse);

    const event = {body} as any;
    const result = await createProduct(event, null, null);

    expect(productsService.createProduct).toHaveBeenCalledWith(body);
    expect(result).toEqual(formatSuccessResponse(mockResponse));
  });

  it('should return an error response when creating a product fails', async () => {
    const body = mockItemRequestBody;
    const error = new Error('Failed to create product');
    (productsService.createProduct as jest.Mock).mockRejectedValueOnce(error);

    const event = {body} as any;
    const result = await createProduct(event, null, null);

    expect(productsService.createProduct).toHaveBeenCalledWith(body);
    expect(result).toEqual(formatErrorResponse(error));
  });
});
