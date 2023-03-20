import * as AWS from 'aws-sdk';
import {S3CreateEvent} from "aws-lambda";
import csvParser from "csv-parser";

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
  const s3Stream = s3.getObject({
    Bucket: bucket,
    Key: key,
  }).createReadStream()


  s3Stream.pipe(csvParser())

  await new Promise((resolve, reject) =>{
    s3Stream.on('data', async (data) => {
      log(JSON.stringify(data))
    })
    s3Stream.on('end', () => {
      log('CSV file processing completed')
      resolve(undefined)
    });
    s3Stream.on('error', (error)=>{
      log(error.message)
      reject(error)
    });
  });

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
