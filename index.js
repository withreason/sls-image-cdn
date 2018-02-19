import parseParams, {paramsToPathString} from './src/parseParams';
import validateParams from './src/validateParams';
import {downloadImage, uploadImage} from './src/cdnHelper';
import {transformImage} from './src/transformImage';

const resizerPromise = (event, context, path) => {
  let modifiers = parseParams(path);
  if (modifiers.key === 'favicon') {
    return Promise.resolve({statusCode: 404, body: ''})
  }
  console.log('Modifiers', modifiers);
  return validateParams(modifiers)
    .then(validModifiers => modifiers = validModifiers)
    .then(() => downloadImage(
      modifiers.key,
      modifiers.format))
    .then(image => transformImage(image, modifiers))
    .then(transformedImageBuffer => uploadImage(
      transformedImageBuffer,
      modifiers.key,
      modifiers.format,
      paramsToPathString(modifiers)))
    .then(info => {
      const result = {
        statusCode: 302,
        headers: {
          'Content-Type': info.contentType,
          Location: info.url,
        },
        body: '',
      };
      console.log('Returning with', result);
      return result;
  });
};

export const resizer = (event, context, callback) => {
  const path = decodeURIComponent(event.pathParameters.path);
  if (!path) {
    return callback(new Error('Path cannot be empty'));
  }

  return resizerPromise(event, context, path)
    .then(resp => callback(null, resp))
    .catch((err) => {
      console.error(err);
      if (err.isJoi) {
        return callback(null, { statusCode: 400, body: err.toString() });
      }
      if(err.code === 'NoSuchKey') {
        return callback(null, { statusCode: 404 });
      }
      return callback(err);
    });
};
