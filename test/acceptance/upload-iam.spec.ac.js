
import chai from 'chai';
const { expect } = chai;
import { unlinkSync } from 'fs';
import { fetchFile, compareFileSizes, requestUploadUrl, uploadFile} from './test-utils'

const apiEndpoint = process.env.API_ENDPOINT;

const INPUT_FILE = './test/acceptance/test.jpg';
const OUTPUT_FILE = './test/acceptance/test-out.jpg';

describe('IAM authentication', () => {
  beforeEach(() => {
    try {
      unlinkSync(OUTPUT_FILE)
    } catch (err) {}
  })

  afterEach(() => {
    try {
      unlinkSync(OUTPUT_FILE)
    } catch (err) {}
  })

  it('can upload and retrieve the image as is', () => {
    return requestUploadUrl(apiEndpoint, { contentType: 'image/jpg'})
      .then(uploadUrlResult => {
        expect(uploadUrlResult.upload).to.exist;
        return uploadFile(uploadUrlResult.upload, INPUT_FILE)
          .then(() => fetchFile(uploadUrlResult.url, OUTPUT_FILE))
          .then(() => expect(compareFileSizes(INPUT_FILE, OUTPUT_FILE)).to.equal(0))
      });
  });

  it('can upload and retrieve a smaller image ', () => {
    return requestUploadUrl(apiEndpoint, { contentType: 'image/jpg'})
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
    return requestUploadUrl(apiEndpoint, { contentType: 'image/jpg', filename: 'test.jpg'})
      .then(uploadUrlResult => {
        expect(uploadUrlResult.url.endsWith('/test.jpg')).to.be.true;
        return uploadFile(uploadUrlResult.upload, INPUT_FILE)
          .then(() => fetchFile(`${uploadUrlResult.url.substr(0, uploadUrlResult.url.length - 4)},w_50.jpg`, OUTPUT_FILE))
          .then(() => expect(compareFileSizes(INPUT_FILE, OUTPUT_FILE)).to.be.greaterThan(0));
      });
  });

  it('can NOT upload with an unsigned request', () => {
    return requestUploadUrl(apiEndpoint, { contentType: 'image/jpg'}, {}) // No headers so no signature
      .then(uploadUrlResult => expect(uploadUrlResult.status).to.equal(403));
  });

});