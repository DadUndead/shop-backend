import {middyfy} from '@libs/lambda';
import * as process from "process";
import {APIGatewayRequestAuthorizerEvent} from "aws-lambda/trigger/api-gateway-authorizer";

const basicAuthorizer = async (event: APIGatewayRequestAuthorizerEvent) => {
  const authHeader = event.headers['Authorization'];

  if (!authHeader) {
    return {
      statusCode: 401,
      body: 'Authorization header is not provided'
    }
  }

  const token = Buffer.from(authHeader.split(" ")[1], 'base64').toString()

  const [username, password] = token.split(':');

  const storedPassword = process.env[username];
  const isValid = password===storedPassword;

  return {
    principalId: username,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: isValid ? 'Allow' : 'Deny',
          Resource: '*',
        },
      ],
    },
  };
};

export const main = middyfy(basicAuthorizer);
