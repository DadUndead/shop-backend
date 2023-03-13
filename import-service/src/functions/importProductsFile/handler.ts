import {middyfy} from '@libs/lambda';
import * as AWS from 'aws-sdk';
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<undefined> = async (event) => {
  const fileName = event.queryStringParameters.name;
  const params = {
    Bucket: 'ug-uploads',
    Key: `uploaded/${fileName}`,
    Expires: 60,
    ContentType: 'text/csv'
  }
  const s3 = new AWS.S3({region: 'eu-west-1'})

  const url =  await s3.getSignedUrlPromise('putObject', params);

  return formatJSONResponse({url});
};

export const main = middyfy(importProductsFile);
