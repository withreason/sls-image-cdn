import { S3 } from 'aws-sdk';
import s3PublicUrl from 's3-public-url';

const s3 = new S3();

const BUCKET_NAME = process.env.SOURCE_S3_BUCKET_NAME;
const CUSTOM_URL = process.env.SOURCE_S3_WEBSITE;
const CLOUD_FRONT_URL = process.env.CLOUD_FRONT_URL;
const AWS_REGION = process.env.AWS_REGION;

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
	};

	return new Promise((resolve, reject) => {
		s3.putObject(params, (err, data) => {
			if (err) {
				console.error(err.code, '-', err.message);
				return reject(err);
			}
			//TODO fix the cloud front redirect issue properly when adding cloud front to the cdn stack
			const url = CLOUD_FRONT_URL ? s3PublicUrl.getHttps(BUCKET_NAME, filename, AWS_REGION)
				: CUSTOM_URL ? `${CUSTOM_URL}/${filename}`
				: `http://${BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com/${filename}`;
			return resolve({
				url,
				...data,
			});
		});
	});
};
