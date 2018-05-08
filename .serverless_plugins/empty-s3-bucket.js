'use strict';

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
    const bucketName = serverless.service.custom.bucketName;

    serverless.cli.log(`Getting all objects in S3 bucket ${bucketName} ...`);
    return provider.request('S3', 'listObjectsV2', {
      Bucket: bucketName,
    }).then(result => {
      if (result.Contents.length === 0) {
        return;
      }

      serverless.cli.log(`Removing objects in S3 bucket ${bucketName}...`);
      return provider.request('S3', 'deleteObjects', {
        Bucket: bucketName,
        Delete: {
          Objects: result.Contents.map(content => ({Key: content.Key})),
        },
      }).then(() => {
        if (result.IsTruncated) {
          return this.emptyS3Bucket(serverless);
        }
      })
    });
  }
};
