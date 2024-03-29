import {handlerPath} from '@libs/handler-resolver';
import {FunctionInterface} from "../../model/types";


export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment:{
    CatalogBatchProcessQueueUrl: "${self:custom.dotenvVars.CatalogBatchProcessQueueUrl, env:CatalogBatchProcessQueueUrl, ''}",
  },
  events: [
    {
      s3: {
        bucket: 'ug-uploads',
        event: "s3:ObjectCreated:*",
        rules: [
          {
            prefix: 'uploaded/',
          },
          {
            suffix: '.csv'
          }
        ],
        existing: true,
        forceDeploy: true
      },
    },
  ],
} as FunctionInterface;

