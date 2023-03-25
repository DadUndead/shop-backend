import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        cors: true,
        summary: "Creates a pre-sign url for uploading .csv file",
        description: "Creates a pre-sign url for uploading .csv file",
        authorizer: {
          name: 'basicAuthorizer',
          arn: '${self:custom.authArn}',
          type: 'request',
          identitySource: 'method.request.header.Authorization',
          resultTtlInSeconds: 0,
        },
        request: {
          parameters: {
            querystrings: {
              name: true
            }
          },
        },
        responseData: {
          200: {
            description: "Creates a pre-sign url for uploading .csv file",
          },
          400: {
            description: 'Request failed'
          },
          500: {
            description: 'Server Error'
          }
        }
      }
    },
  ],
}
