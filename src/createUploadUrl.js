import { S3 } from 'aws-sdk';
import s3PublicUrl from 's3-public-url';
import env from './env';

const s3 = new S3({
  signatureVersion: 'v4'
});

const uuidv4 = require('uuid/v4');

const ONE_MINUTE = 60;

function generateKey() {
  const month = new Date().toISOString().substr(0, 7);
  switch(env.upload.storageStrategy) {
    case 'date':
      return month + '/' + String(Date.now());
    case 'uuidByPrefix':
      const uuid = uuidv4();
      return uuid.substr(0, 4) + '/' + uuid;
    case 'uuidByDate':
    default:
      return month + '/' + uuidv4();
  }
}

function createUrl(contentType, filename) {
  let key = generateKey();

  if (filename) {
    key += `/${filename}`;
  } else {
    const subtype = contentType.split('/')[1];
    if (subtype) {
      key += `.${subtype}`;
    }
  }

  const signatureOptions = {
    Bucket: env.bucketName,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
    Expires: ONE_MINUTE
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', signatureOptions, (err, url) => {
      return err ? reject(err) : resolve({
        upload: url,
        url: env.cloudFront.domain
          ? `https://${env.cloudFront.domain}/${key}`
          : env.customUrl
            ? `${env.customUrl}/${key}`
            : `http://${env.bucketName}.s3-website-${env.region}.amazonaws.com/${key}`
      });
    });
  });
}

export default function (event, context, callback) {
  let body;
  try {
    body = event.body && JSON.parse(event.body);
  } catch (err) {
    return callback(null, {statusCode: 400, body: JSON.stringify({ reason: 'a JSON body is required'})});
  }

  const contentType = body.contentType;
  if (!contentType) {
    callback(null, {statusCode: 422, body: JSON.stringify({ reason: 'the body field contentType is required'})});
  }
  const filename = body.filename;

  return createUrl(contentType, filename)
    .then(body => callback(null, {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*'
      },
      body: JSON.stringify(body)}))
    .catch(callback);
}