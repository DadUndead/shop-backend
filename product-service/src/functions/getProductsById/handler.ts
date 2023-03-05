import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {middyfy} from '@libs/lambda';
import {APIGatewayProxyResult} from "aws-lambda";
import productsService from "../../service";

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event): Promise<APIGatewayProxyResult> => {

  const {productId} = event.pathParameters
  try {
    const item = await productsService.getProductById(productId)

    if (!item){
      return formatJSONResponse(404, undefined);
    }

    return formatJSONResponse(200, item);
  } catch (e) {
    return formatJSONResponse(500, e)
  }
};

export const main = middyfy(getProductsById);
