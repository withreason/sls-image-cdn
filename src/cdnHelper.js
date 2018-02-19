import { S3 } from 'aws-sdk';

const s3 = new S3();

const BUCKET_NAME = process.env.SOURCE_S3_BUCKET_NAME;
const CUSTOM_URL = process.env.SOURCE_S3_WEBSITE;
const CLOUD_FRONT_DOMAIN = process.env.CLOUD_FRONT_DOMAIN;
const AWS_REGION = process.env.AWS_REGION;
const CACHE_MAX_AGE = process.env.CACHE_MAX_AGE || 31536000; // default to 1 yesr

/**
 * Downloads a image from the bucket.
 * @param key the id the the image to download.
 * @param format the image format.
 * @returns {Promise<any>} a promise of the image data.
 */
export const downloadImage = (key, format) => {
	const filename = [key, '.', format].join('');
	const params = {
		Bucket: BUCKET_NAME,
		Key: filename,
	};

	return new Promise((resolve, reject) => {
		s3.getObject(params, (err, data) => {
			if (err) {
				console.error(err.code, '-', err.message);
				return reject(err);
			}
			return resolve(data.Body);
		});
	});
};

/**
 * Uploads an image to a bucket
 * @param imageBuffer the image data to upload.
 * @param key the id the the image to upload.
 * @param format the image format.
 * @param paramsString the set of parameters used to create the image in url format.
 * @returns {Promise<any>} { url, }
 */
export const uploadImage = (imageBuffer, key, format, paramsString = '') => {
	const filename = [key, ',', paramsString, '.', format].join('');
	const params = {
		Bucket: BUCKET_NAME,
		Key: filename,
		Body: imageBuffer,
		ACL: 'public-read',
		ContentType: ['image', format].join('/'),
		CacheControl: `max-age=${CACHE_MAX_AGE}`
	};

	return new Promise((resolve, reject) => {
		s3.putObject(params, (err, data) => {
			if (err) {
				console.error(err.code, '-', err.message);
				return reject(err);
			}
			const url = CLOUD_FRONT_DOMAIN ? `https://${CLOUD_FRONT_DOMAIN}/${filename}`
        : CUSTOM_URL ? `${CUSTOM_URL}/${filename}`
				: `http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com/${filename}`;
			return resolve({
        url,
				contentType: params.ContentType,
				...data,
			});
		});
	});
};
