import * as AWS from 'aws-sdk';
import {S3CreateEvent} from "aws-lambda";
import csvParser from "csv-parser";
import {CloudWatchLogsClient, PutLogEventsCommand} from "@aws-sdk/client-cloudwatch-logs";

const logsClient = new CloudWatchLogsClient({});
const log = (message: string) => {
  console.log(message)

  return logsClient
      .send(new PutLogEventsCommand({
        logGroupName: 'import-file-parser',
        logStreamName: 'importing-file',
        logEvents: [
          {
            message,
            timestamp: Date.now()
          }
        ],
      }))
      .catch(err => {
        console.log(err, err?.stack)
      })
}
export const importFileParser = async (event: S3CreateEvent) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const s3 = new AWS.S3({region: 'eu-west-1'})
  const s3Stream = s3.getObject({
    Bucket: bucket,
    Key: key,
  }).createReadStream()

  s3Stream
      .pipe(csvParser())
      .on('data', async (data) => {
        await log(JSON.stringify(data))
      })
      .on('error', async (error) => {
        await log(error.message)
      })
      .on('end', async () => {
        await log('CSV file processing completed')
      })

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
