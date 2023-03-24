import { createBatchProcess } from "../handler";
import {SQSEvent} from "aws-lambda";
import productsService from "../../../service";
import * as AWS from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";

new AWS.SNS({region: 'eu-west-1'});
jest.mock('../../../service', () => ({
  __esModule: true,
  default: {
    createProduct: jest.fn(),
  },
}));

describe("createBatchProcess function", () => {
  const validProduct = {
    title: "Test Product",
    description: "This is a test product",
    price: 10.99,
    count: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a product and send an SNS message", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify(validProduct),
          messageId: "1",
        },
      ],
    } as SQSEvent;

    const mockSNSPublish = jest.fn();

    AWSMock.mock("SNS", "publish", (params: AWS.SNS.PublishInput, callback: Function) => {
      mockSNSPublish(params);
      callback(null, { MessageId: "mock-message-id" });
    });

    const expectedParams = {
      Message: JSON.stringify(validProduct),
      TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
      MessageAttributes: {
        price: {
          DataType: "Number",
          StringValue: validProduct.price.toString(),
        },
      },
    };

    (productsService.createProduct as jest.Mock).mockResolvedValue(null);

    const response = await createBatchProcess(event);

    expect(productsService.createProduct).toHaveBeenCalledWith(validProduct);
    expect(mockSNSPublish).toHaveBeenCalledWith(expectedParams);
    expect(response).toEqual({ batchItemFailures: [] });
  });

});
