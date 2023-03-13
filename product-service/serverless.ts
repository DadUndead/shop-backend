import type {AWS} from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductsById from "@functions/getProductsById";
import createProduct from "@functions/createProduct";

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

      ENV_STAGE: "${opt:stage, 'dev'}",
      PGHOST: "${self:custom.dotenvVars.PGHOST, env:PGHOST, ''}",
      PGUSER: "${self:custom.dotenvVars.PGUSER, env:PGUSER, ''}",
      PGDATABASE: "${self:custom.dotenvVars.PGDATABASE, env:PGDATABASE, ''}",
      PGPASSWORD: "${self:custom.dotenvVars.PGPASSWORD, env:PGPASSWORD, ''}",
      PGPORT: "${self:custom.dotenvVars.PGPORT, env:PGPORT, ''}",
    },
  },
  functions: {
    getProductsById,
    getProductsList,
    createProduct,
  },
  package: {
    individually: true,
  },
  custom: {
    dotenvVars: '${file(configs.js)}',
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
      exclude: ['aws-sdk', 'pg-native'],
      target: 'node14',
      define: {'require.resolve': undefined},
      platform: 'node',
      concurrency: 10,
      watch: './**/*.(js|ts)',

    },
    migrate: {
      stateFile: '.migrate2',
      lastRunIndicator:'<*****',
      noDescriptionText: '?',
      ignoreMissing: true,
      dateFormat: 'yyyy-MM-dd hh:mm:ssZ',
      migrationDir: "migrations",
      environment: {
        // ANOTHER_ENV: 'overriden value',
        // COMPLEX_VAR: "${self:provider.env.ANOTHER_ENV, 'unexistent'}",
        // EXAMPLE_ENV: false,
      }
    },
  },
  resources: {
    Resources: {
      PostgreSqlRDSInstance: {
        Type: 'AWS::RDS::DBInstance',
        Properties: {
          MasterUsername: "${self:custom.dotenvVars.PGUSER, env:PGUSER, ''}",
          MasterUserPassword: "${self:custom.dotenvVars.PGPASSWORD, env:PGPASSWORD, ''}",
          AllocatedStorage: 20,
          DBName: "${self:custom.dotenvVars.PGDATABASE, env:PGDATABASE, ''}",
          DBInstanceClass: 'db.t3.micro',
          Engine: 'postgres',
          PubliclyAccessible: true
        },
      },
    }
  }
};

module.exports = serverlessConfiguration;
