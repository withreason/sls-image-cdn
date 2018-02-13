var env = require('./src/env');
var crypto = require('crypto');

function getHash(name) {
  return crypto.createHash('sha1').update(name).digest("hex").substr(0, 5);
}

// Use hash here to keep the names short. using the full bucket name can breach aws resource lengths for lambda roles.
module.exports.serviceName = function() {
  return `sls-image-cdn-${getHash(env.cloudFront.domain || env.bucketName)}`;
}

module.exports.uploadAuthorizerName =  function() {
  return env.upload.authorizerFile ? 'customUploadAuthorizer' : 'aws_iam';
}