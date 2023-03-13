import type {AWS} from '@serverless/typescript';
import importProductsFile from "@functions/importProductsFile";
import importFileParser from "@functions/importFileParser";


const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: [
    'serverless-auto-swagger',
    'serverless-esbuild',
    'serverless-offline',
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
    iamRoleStatements:[
      {
        Effect: "Allow",
        Action: "s3:ListBucket",
        Resource: "arn:aws:s3:::ug-uploads"
      },
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: "arn:aws:s3:::ug-uploads/*"
      }
    ]
  },
  functions: {
    importProductsFile,
    importFileParser,
  },
  package: {individually: true},
  custom: {
    autoswagger: {
      apiType: 'http',
      generateSwaggerOnDeploy: true,
      basePath: `/dev/`,
      useStage: false,
      excludeStages: [], // TODO: make it available only for dev
      typefiles: ['./src/model/types.d.ts']
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: {'require.resolve': undefined},
      platform: 'node',
      concurrency: 10,
      watch: './**/*.(js|ts)',
    },
    'serverless-offline':{
      httpPort: 4000,
    }
  }
};

module.exports = serverlessConfiguration;
