import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'products',
        cors: true,
        summary: "Creates a new Product",
        description: "Creates a new Product",
        bodyType: 'CreateProductParams',
        request: {
          schemas: {
            'application/json': '${file(src/functions/createProduct/schema.json)}'
          }
        },
        responseData: {
          200: {
            description: "Creates a new Product",
            bodyType: 'Product'
          },
          400: {
            description: 'Request failed'
          },
          500: {
            description: 'Server Error'
          }
        }
      }
    }
  ]
};
