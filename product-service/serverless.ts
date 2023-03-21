import type {AWS} from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductsById from "@functions/getProductsById";
import createProduct from "@functions/createProduct";
import catalogBatchProcess from "@functions/catalogBatchProcess";

const stage = process.env.STAGE!;
console.log({stage});

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: [
    'serverless-auto-swagger',
    'serverless-esbuild',
    'serverless-offline',
    'serverless-migrate-plugin'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: "${opt:stage, 'dev'}",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',

      stage: "${opt:stage, 'dev'}",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "sns:Publish",
        Resource: {Ref: "createProductTopic"},
      },
      {
        Effect: "Allow",
        Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
        ],
        Resource: "arn:aws:dynamodb:eu-west-1:*:*"
      }
    ]
  },
  functions: {
    getProductsById,
    getProductsList,
    createProduct,
    catalogBatchProcess,
  },
  package: {
    individually: true,
  },
  custom: {
    dotenvVars: '${file(configs.js)}',
    "serverless-offline": {
      httpPort: 4000
    },
    autoswagger: {
      apiType: 'http',
      generateSwaggerOnDeploy: false,
      basePath: `/dev/`,
      useStage: false,
      excludeStages: [], // TODO: make it available only for dev
      typefiles: ['./src/model/types.d.ts']
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk', 'pg-native'],
      target: 'node14',
      define: {'require.resolve': undefined},
      platform: 'node',
      concurrency: 10,
      watch: './**/*.(js|ts)',

    },
    migrate: {
      stateFile: '.migrate2',
      lastRunIndicator: '<*****',
      noDescriptionText: '?',
      ignoreMissing: true,
      dateFormat: 'yyyy-MM-dd hh:mm:ssZ',
      migrationDir: "migrations",
      environment: {}
    },
  },
  resources: {
    Resources: {
      products: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: 'products',
          AttributeDefinitions: [{
            AttributeName: 'id',
            AttributeType: 'S',
          }],
          KeySchema: [{
            AttributeName: 'id',
            KeyType: 'HASH'
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      },
      stocks: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: 'stocks',
          AttributeDefinitions: [{
            AttributeName: 'product_id',
            AttributeType: 'S',
          }],
          KeySchema: [{
            AttributeName: 'product_id',
            KeyType: 'HASH'
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      },
      CatalogBatchProcessQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "CatalogBatchProcessQueue"
        }
      },
      createProductTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          DisplayName: "Create Product Topic",
          TopicName: "createProductTopic",
        }
      },
      createProductTopicEmailSubscription1: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "email",
          Endpoint: "ralict2@gmail.com",
          TopicArn: {Ref: 'createProductTopic'},
          FilterPolicy: {
            price: [{numeric: [">", 100]}]
          }
        }
      },
      createProductTopicEmailSubscription2: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "email",
          TopicArn: {Ref: 'createProductTopic'},
          Endpoint: "ralict@mail.ru",
          FilterPolicy: {
            price: [{numeric: ["<=", 100]}]
          }
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
