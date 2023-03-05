import type {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda"
import {logger} from "../utils/logger";
import {FromSchema} from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatSuccessResponse = (response: object, statusCode = 200 ) => {
  logger.logRequest(`Lambda successfully invoked and finished`);

  return {
    statusCode: statusCode,
    body: JSON.stringify(response)
  }
}

export const formatErrorResponse = (err: Error, statusCode = 500) => {
  logger.logRequest(`Error: ${err.message}`);

  return {
    statusCode: statusCode,
    body: JSON.stringify({message: err.message || 'Something went wrong!'})
  }
}
