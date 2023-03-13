import { importFileParser } from '../handler';
import { S3CreateEvent } from 'aws-lambda';
import * as AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';

xdescribe('importFileParser', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
  });

  afterEach(() => {
    AWSMock.restore('S3');
  });

  it('should parse a CSV file from S3', async () => {
    const s3CreateEvent = {
      Records: [
        {
          s3: {
            bucket: {
              name: 'my-bucket',
            },
            object: {
              key: 'my-file.csv',
            },
          },
        },
      ],
    } as S3CreateEvent;

    const mockS3Stream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === 'data') {
          cb({ col1: 'value1', col2: 'value2' });
        } else if (event === 'error') {
          cb(new Error('test error'));
        } else if (event === 'end') {
          cb();
        }
        return mockS3Stream;
      }),
    };

    AWSMock.mock('S3', 'getObject', (_params, _callback) => {
      return {
        createReadStream: () => mockS3Stream,
      }
    });

    AWSMock.mock('S3', 'copyObject', (_params, callback) => {
      callback(null, {});
    });

    AWSMock.mock('S3', 'deleteObject', (_params, callback) => {
      callback(null, {});
    });

    const mockLogsClient = {
      send: jest.fn().mockImplementation(() => ({
        catch: jest.fn(),
      })),
    };

    const mockCloudWatchLogsClient = jest.fn().mockReturnValue(mockLogsClient);
    jest.mock('@aws-sdk/client-cloudwatch-logs', () => ({
      CloudWatchLogsClient: mockCloudWatchLogsClient,
      PutLogEventsCommand: jest.fn(),
    }));

    await importFileParser(s3CreateEvent);

    expect(mockS3Stream.pipe).toHaveBeenCalledWith(expect.any(Object));
    expect(mockS3Stream.on).toHaveBeenCalledWith('data', expect.any(Function));
    expect(mockS3Stream.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockS3Stream.on).toHaveBeenCalledWith('end', expect.any(Function));
    expect(mockLogsClient.send).toHaveBeenCalledTimes(3);
    expect(mockCloudWatchLogsClient).toHaveBeenCalledWith({});
  });
});
