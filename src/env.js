
module.exports = {
  bucketName: process.env.SOURCE_S3_BUCKET_NAME,
  customUrl: process.env.SOURCE_S3_WEBSITE,
  region: process.env.AWS_REGION,
  upload: {
    storageStrategy: process.env.UPLOAD_STORAGE_STRATEGY,
    authorizerFile: process.env.UPLOAD_AUTHORIZER_FILE,
  },
  cloudFront: {
    domain: process.env.CLOUD_FRONT_DOMAIN
  },
  cache: {
    maxAge: process.env.CACHE_MAX_AGE || 31536000, // default to 1 year
  }
}