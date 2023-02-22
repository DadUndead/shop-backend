import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'product/{productId}',
        summary: "Get Product",
        description: "Returns a product by id",
        responseData: {
          200: {
            description: "Returns a product by id",
            bodyType: 'Product'
          },
          400: {
            description: 'Request failed'
          },
          404: {
            description: 'Product not found'
          },
          500: {
            description: 'Server Error'
          }
        }
      },
    },
  ],
};
