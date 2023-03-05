import {formatErrorResponse, formatSuccessResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {middyfy} from '@libs/lambda';
import {APIGatewayProxyResult} from "aws-lambda";
import productsService from "../../service";
import schema from './schema.json';
import {logger} from "../../utils/logger";

export const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event): Promise<APIGatewayProxyResult> => {
  logger.logRequest(`Incoming event: ${JSON.stringify(event)}`)

  try {
    const item = await productsService.createProduct(event.body)

    logger.logRequest(`Created product: ${JSON.stringify(event)}`)
    return formatSuccessResponse(item);
  } catch (e) {
    return formatErrorResponse(e)
  }
}

export const main = middyfy(createProduct);
