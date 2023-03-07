import {formatErrorResponse, formatSuccessResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {middyfy} from '@libs/lambda';
import {APIGatewayProxyResult} from "aws-lambda";
import productsService from "../../service";
import schema from './schema';
import {logger} from "../../utils/logger";
import validator from "@middy/validator";
import {transpileSchema} from "@middy/validator/transpile";

export const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event): Promise<APIGatewayProxyResult> => {
  logger.logRequest(`Incoming event body: ${event.body}`)

  try {
    const item = await productsService.createProduct(event.body)

    logger.logRequest(`Created product: ${JSON.stringify(item)}`)
    return formatSuccessResponse(item);
  } catch (e) {
    return formatErrorResponse(e)
  }
}

export const main = middyfy(createProduct)
    .use(validator({
      eventSchema: transpileSchema({
        type: 'object',
        required: ['body'],
        properties: {
          body: schema
        }
      })
    }));
