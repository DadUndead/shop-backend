import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {middyfy} from '@libs/lambda';
import {APIGatewayProxyResult} from "aws-lambda";
import productsService from "../../service";

export const getProductsList: ValidatedEventAPIGatewayProxyEvent<unknown> = async (): Promise<APIGatewayProxyResult> => {

  try {
    const items = await productsService.getProductsList()

    return formatJSONResponse(200, items);
  } catch (e) {
    return formatJSONResponse(500, e)
  }
}

export const main = middyfy(getProductsList);
