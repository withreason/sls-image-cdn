
function sanatiseName(name) {
  return name.replace(/[^A-Za-z0-9]/g, '-');
}

module.exports.serviceName = () => sanatiseName(`sls-image-cdn-${process.env.SOURCE_S3_BUCKET_NAME}`);