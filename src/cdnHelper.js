import { S3 } from 'aws-sdk';
import env from './env';

const s3 = new S3();

/**
 * Downloads a image from the bucket.
 * @param key the id the the image to download.
 * @param format the image format.
 * @returns {Promise<any>} a promise of the image data.
 */
export const downloadImage = (key, format) => {
	const filename = [key, '.', format].join('');
	const params = {
		Bucket: env.bucketName,
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
		Bucket: env.bucketName,
		Key: filename,
		Body: imageBuffer,
		ACL: 'public-read',
		ContentType: ['image', format].join('/'),
		CacheControl: `max-age=${env.cache.maxAge}`
	};

	return new Promise((resolve, reject) => {
		s3.putObject(params, (err, data) => {
			if (err) {
				console.error(err.code, '-', err.message);
				return reject(err);
			}
			const url = env.cloudFront.domain ? `https://${env.cloudFront.domain}/${filename}`
        : env.customUrl ? `${env.customUrl}/${filename}`
				: `http://${env.bucketNam}.s3-website-${env.region}.amazonaws.com/${filename}`;
			return resolve({
        url,
				contentType: params.ContentType,
				...data,
			});
		});
	});
};
