import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'products',
        cors: true,
        summary: "Get Products List",
        description: "Returns a list of products",
        responseData: {
          200: {
            description: "Returns a products list",
            bodyType: 'ProductsList'
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
