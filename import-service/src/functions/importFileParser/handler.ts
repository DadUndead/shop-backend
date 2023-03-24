import * as AWS from 'aws-sdk';
import {S3CreateEvent} from "aws-lambda";
import {parseStream} from 'fast-csv';

const logsClient = new AWS.CloudWatchLogs({region: 'eu-west-1'});
const log = (message: string) => {
  console.log(message)

  return logsClient.putLogEvents({
    logGroupName: '/import-file-parser',
    logStreamName: 'importing-file',
    logEvents: [
      {
        message,
        timestamp: Date.now()
      }
    ],
  })
}
export const importFileParser = async (event: S3CreateEvent) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const s3 = new AWS.S3({region: 'eu-west-1'})
  const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  const csvFile = s3.getObject({
    Bucket: bucket,
    Key: key,
  }).createReadStream()

  try {
    await new Promise((resolve, reject) => {
      parseStream(csvFile, {headers: true})
          .on('data', async (data) => {
            log(JSON.stringify(data))

            const messageParams = {
              MessageBody: JSON.stringify(data),
              QueueUrl: process.env.CatalogBatchProcessQueueUrl
            };

            try {
              const msg = await sqs.sendMessage(messageParams).promise();
              console.log("Message sent:", msg.MessageId);
            } catch (err) {
              console.log("Error sending message:", err);
            }
          })
          .on('end', () => {
            log('CSV file processing completed')
            resolve(undefined)
          })
          .on('error', (error) => {
            log(error.message)
            reject(error)
          });
    });
  } catch (error) {
    log(error.message)
  }

  await s3.copyObject({
    Bucket: bucket,
    CopySource: `${bucket}/${key}`,
    Key: `parsed/${key.split('/').pop()}`,
  }).promise();

  await s3.deleteObject({
    Bucket: bucket,
    Key: key,
  }).promise();

  await log(`File moved from ${key} to parsed/${key}`);

};

export const main = importFileParser;
