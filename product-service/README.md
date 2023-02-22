# A product-service for Unicorn Guitar shop

## Installation/deployment instructions

Follow the instructions below to deploy your project.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS


## Available scripts

### `start`

Starts the service in `offline` mode. All the endpoint will be available on http://localhost:3000/dev/

### `test`, `test:coverage`

Runs jest unit tests, optionally with coverage

### `deploy`

- Runs unit tests.
- Deploys the service to AWS to `dev` stage.
- Creates all the lambdas described in `functions` folder. Adds lambdas for swagger.

### 3rd party libraries

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file
- [serverless-esbuild](https://github.com/floydspace/serverless-esbuild)- plugin for zero-config JavaScript and TypeScript code bundling using promising fast & furious esbuild bundler and minifier
- [serverless-offline](https://github.com/dherault/serverless-offline) - plugin emulates AWS λ and API Gateway on your local machine to speed up your development cycles. To do so, it starts an HTTP server that handles the request's lifecycle like APIG does and invokes your handlers.
- [serverless-auto-swagger](https://github.com/completecoding/serverless-auto-swagger) - plugin allows you to automatically generate a swagger endpoint, describing your application endpoints. This is built from your existing serverless config and typescript definitions, reducing the duplication of work.

### Info
This project has been generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).
