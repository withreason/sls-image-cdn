'use strict';

const BUCKET_NAME = process.env.SOURCE_S3_BUCKET_NAME;

module.exports = class EmptyS3Bucket {

  constructor(serverless, options) {
    this.hooks = {
      'before:remove:remove': () => this.emptyS3Bucket(serverless),
    }
  }

  emptyS3Bucket(serverless) {
    if (serverless.service.custom.bucketDeletionPolicy !== 'Delete') {
      serverless.cli.log(`Skipping bucket empty. Deletion policy is ${serverless.service.custom.bucketDeletionPolicy}`);
      return;
    }
    const provider = serverless.getProvider('aws');

    serverless.cli.log(`Getting all objects in S3 bucket ${BUCKET_NAME} ...`);
    return provider.request('S3', 'listObjectsV2', {
      Bucket: BUCKET_NAME,
    }).then(result => {
      if (result.Contents.length === 0) {
        return;
      }

      serverless.cli.log(`Removing objects in S3 bucket ${BUCKET_NAME}...`);
      return provider.request('S3', 'deleteObjects', {
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: result.Contents.map(content => ({Key: content.Key})),
        },
      }).then(() => {
        if (result.IsTruncated) {
          return this.emptyS3Bucket(BUCKET_NAME);
        }
      })
    });
  }
};
