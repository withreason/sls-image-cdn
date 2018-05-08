
const chai = require('chai');
const expect = chai.expect;
const unlinkSync = require('fs').unlinkSync;
const testUtils = require('./test-utils');
const fetchFile = testUtils.fetchFile;
const compareFileSizes = testUtils.compareFileSizes;
const requestUploadUrl = testUtils.requestUploadUrl;
const uploadFile = testUtils.uploadFile;

const apiEndpoint = process.env.API_ENDPOINT;

const INPUT_FILE = './test/acceptance/test.jpg';
const OUTPUT_FILE = './test/acceptance/test-out.jpg';

describe('custom authenticator', () => {
  beforeEach(() => {
    try {
      unlinkSync(OUTPUT_FILE)
    } catch (err) {}
  });

  afterEach(() => {
    try {
      unlinkSync(OUTPUT_FILE)
    } catch (err) {}
  })

  it('can upload and retrieve the image as is', () => {
    return requestUploadUrl(apiEndpoint, { contentType: 'image/jpg'}, { Authorization: 'acc-test' })
      .then(uploadUrlResult => {
        expect(uploadUrlResult.upload).to.exist;
        return uploadFile(uploadUrlResult.upload, INPUT_FILE)
          .then(() => fetchFile(uploadUrlResult.url, OUTPUT_FILE))
          .then(() => expect(compareFileSizes(INPUT_FILE, OUTPUT_FILE)).to.equal(0))
      });
  });

  it('can upload and retrieve a smaller image ', () => {
    return requestUploadUrl(apiEndpoint, { contentType: 'image/jpg'}, { Authorization: 'acc-test' })
      .then(uploadUrlResult => {
        expect(uploadUrlResult.upload).to.exist;
        return uploadFile(uploadUrlResult.upload, INPUT_FILE)
          .then(() => {
            return fetchFile(`${uploadUrlResult.url.substr(0, uploadUrlResult.url.length - 4)},w_50.jpg`, OUTPUT_FILE)
          })
          .then(() => expect(compareFileSizes(INPUT_FILE, OUTPUT_FILE)).to.be.greaterThan(0))
      });
  });

  it('can upload and retrieve with a filename suffix', () => {
    return requestUploadUrl(apiEndpoint, { contentType: 'image/jpg', filename: 'test.jpg'}, { Authorization: 'acc-test' })
      .then(uploadUrlResult => {
        expect(uploadUrlResult.url.endsWith('/test.jpg')).to.be.true;
        return uploadFile(uploadUrlResult.upload, INPUT_FILE)
          .then(() => fetchFile(`${uploadUrlResult.url.substr(0, uploadUrlResult.url.length - 4)},w_50.jpg`, OUTPUT_FILE))
          .then(() => expect(compareFileSizes(INPUT_FILE, OUTPUT_FILE)).to.be.greaterThan(0));
      });
  });

  it('can NOT upload with an unsigned request', () => {
    return requestUploadUrl(apiEndpoint, { contentType: 'image/jpg'}, {})
      .then(uploadUrlResult => expect(uploadUrlResult.status).to.equal(401));
  });

});