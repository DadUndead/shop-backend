import {importFileParser} from '../handler';
import {S3CreateEvent} from 'aws-lambda';
import AWSMock from 'aws-sdk-mock';

const AWS = require('aws-sdk');
new AWS.S3({region: 'eu-west-1'});

describe('importFileParser', () => {
  const mockS3GetObject = jest.fn();
  const mockS3CopyObject = jest.fn();
  const mockS3DeleteObject = jest.fn();

  beforeEach(async () => {
    AWSMock.setSDKInstance(AWS);

    AWSMock.mock('S3', 'getObject', (params, callback) => {
      mockS3GetObject(params)

      callback(null, {});
    });

    AWSMock.mock('S3', 'copyObject', (params, callback) => {
      mockS3CopyObject(params);
      callback(null, {});
    });

    AWSMock.mock('S3', 'deleteObject', (params, callback) => {
      mockS3DeleteObject(params);
      callback(null, {});
    });
  });

  afterEach(() => {
    AWSMock.restore();
  });

  test('should process CSV file and move it to parsed folder', async () => {
    const event = {
      Records: [{
        s3: {
          bucket: {name: 'bucket-name'},
          object: {key: 'file.csv'}
        }
      }],
    } as S3CreateEvent;

    await importFileParser(event);

    expect(mockS3GetObject).toHaveBeenCalledWith({
      Bucket: "bucket-name",
      Key: "file.csv"
    });

    expect(mockS3CopyObject).toHaveBeenCalledWith({
      Bucket: 'bucket-name',
      CopySource: 'bucket-name/file.csv',
      Key: 'parsed/file.csv',
    });
    expect(mockS3DeleteObject).toHaveBeenCalledWith({
      Bucket: 'bucket-name',
      Key: 'file.csv',
    });
  });
});