const chai = require('chai');
const expect = chai.expect;
const createReadStream = require('fs').createReadStream;
const createWriteStream = require('fs').createWriteStream;
const statSync = require('fs').statSync;
const fetch = require('node-fetch');
const aws4 = require('aws4');
const URL = require('url-parse');

const env = process.env;
const credentials = {
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
};

const API_REGEX = /^https:\/\/(.+)\.execute-api\.(.+)\.amazonaws.com\/(.+)$/;

function makeRequest(url, method, body, headers) {
  return fetch(url, { method, body, headers });
}

function makeSignedRequest(url, method, body) {
  const parsedUrl = new URL(url);

  const region = API_REGEX.exec(url)[2];

  const requestOptions = {
    service: 'execute-api',
    host: parsedUrl.host,
    region: region,
    method: method,
    path: parsedUrl.pathname || '/',
    headers: {},
    body: body
  };
  if (parsedUrl.query) {
    requestOptions.path += parsedUrl.query;
  }
  return makeRequest(url, method, body, aws4.sign(requestOptions, credentials).headers);
}

function writeResponseToFile(res, fileName) {
  return new Promise((resolve, reject) => {
    try {
      res.body.pipe(createWriteStream(fileName)).on('finish', resolve);
    } catch (err) {
      reject(err);
    }
  })
}

function requestUploadUrl(apiEndpoint, options, headers) {
  return (headers
    ? makeRequest(`${apiEndpoint}/upload-url`, 'POST', JSON.stringify(options), headers)
    : makeSignedRequest(`${apiEndpoint}/upload-url`,'POST', JSON.stringify(options)))
    .then(res => res.ok ? res.json() : res.text().then(text => ({ status: res.status, text})))
}

function uploadFile(url, fileName) {
  const fileStats = statSync(fileName);
  const imageStream = createReadStream(fileName);
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Length': fileStats.size
    },
    body: imageStream,
  }).then(res => expect(res.ok).to.be.true)
}

function compareFileSizes(f1, f2) {
  const stats1 = statSync(f1);
  const stats2 = statSync(f2);
  return stats1.size - stats2.size;
}

function fetchFile(url, dest) {
  return fetch(url).then(res => writeResponseToFile(res, dest))
}

module.exports = {
  requestUploadUrl,
  uploadFile,
  compareFileSizes,
  fetchFile
};