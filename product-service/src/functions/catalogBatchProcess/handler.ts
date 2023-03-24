import {SQSEvent} from "aws-lambda";
import productsService from "../../service";
import {logger} from "../../utils/logger";
import {CreateProductParams} from "../../model/types";
import * as AWS from "aws-sdk";
import * as process from "process";
import Ajv from "ajv";
import schema from "@functions/createProduct/schema";

type Response = { batchItemFailures: { itemIdentifier: string }[] };
export const createBatchProcess = async (event: SQSEvent): Promise<Response> => {
  logger.logRequest(`Incoming event body: ${JSON.stringify(event.Records)}`)
  const records = event.Records;

  const response: Response = {batchItemFailures: []};

  const ajv = new Ajv({coerceTypes: true});
  const validate = ajv.compile(schema);
  const sns = new AWS.SNS({region: 'eu-west-1'});

  const promises = records.map(async record => {
    const product = JSON.parse(record.body) as CreateProductParams;

    if (!validate(product)){
      logger.logRequest(`Failed to validate product data`)
      response.batchItemFailures.push({itemIdentifier: record.messageId})
      return;
    }

    try {
      logger.logRequest(`Creating product ${product.title}: ${JSON.stringify(product)}`)
      await productsService.createProduct(product);

      const params: AWS.SNS.PublishInput = {
        Message: JSON.stringify(product),
        TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
        MessageAttributes: {
          price: {
            DataType: "Number",
            StringValue: product.price.toString()
          }
        }
      }

      await sns.publish(params).promise();
      logger.logRequest(`Sns message sent ${JSON.stringify(params)}`)
    } catch (e) {
      logger.logRequest(`Failed to create a product`)
      response.batchItemFailures.push({itemIdentifier: record.messageId})
    }
  })

  await Promise.all(promises);

  return response
}

export const main = createBatchProcess;
