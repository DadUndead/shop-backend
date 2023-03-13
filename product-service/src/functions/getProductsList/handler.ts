import {formatErrorResponse, formatSuccessResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {middyfy} from '@libs/lambda';
import {APIGatewayProxyResult} from "aws-lambda";
import productsService from "../../service";
import {logger} from "../../utils/logger";

export const getProductsList: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {
  logger.logRequest(`Incoming event: ${JSON.stringify(event)}`)

  try {
    const items = await productsService.getProductsList()

    logger.logRequest(`Received products: ${JSON.stringify(items)}`)

    return formatSuccessResponse(items);
  } catch (e) {
    return formatErrorResponse(e)
  }
}

export const main = middyfy(getProductsList);
