import {formatErrorResponse, formatSuccessResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {middyfy} from '@libs/lambda';
import {APIGatewayProxyResult} from "aws-lambda";
import productsService from "../../service";
import {logger} from "../../utils/logger";

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  logger.logRequest(`Incoming event: ${JSON.stringify(event)}`)

  const {productId = ''} = event.pathParameters

  try {
    const item = await productsService.getProductById(productId)

    if (!item) {
      return formatErrorResponse({name: 'Error', message: 'Product not found'}, 404);
    }

    logger.logRequest(`Received product with id: ${productId}: ${JSON.stringify(item)}`)

    return formatSuccessResponse(item);
  } catch (e) {
    return formatErrorResponse(e)
  }
};

export const main = middyfy(getProductsById);
