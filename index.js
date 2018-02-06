import parseParams, {paramsToPathString} from './src/parseParams';
import validateParams from './src/validateParams';
import {downloadImage, uploadImage} from './src/cdnHelper';
import {transformImage} from './src/transformImage';

const resizerPromise = (event, context, path) => {
    let modifiers = parseParams(path);
    if (modifiers.guid === 'favicon') {
        return Promise.resolve({statusCode: 404, body: ''})
    }
    console.log('initial modifiers', modifiers);
    return validateParams(modifiers)
        .then((validModifiers) => {
            modifiers = validModifiers;
            // @todo: save image to S3
            // console.log('modifiers', modifiers);
            console.log('validModifiers modifiers', modifiers);
            const {guid, format} = modifiers;
            return Promise.all([
                downloadImage(
                    process.env.SOURCE_S3_BUCKET_NAME,
                    guid,
                    format,
                ),
                modifiers,
            ]);
        })
        .then(([image]) => transformImage(image, modifiers))
        .then((transformedImageBuffer) => {
            const {guid, format} = modifiers;

            return uploadImage(
                process.env.SOURCE_S3_BUCKET_NAME,
                transformedImageBuffer,
                guid,
                format,
                paramsToPathString(modifiers),
            );
        })
        .then(info => {
            console.log('Returning with', info);
            return Promise.resolve({
                statusCode: 302,
                headers: {
                    Location: info.url,
                    'Cache-Control': 'no-cache, no-store'
                },
                body: '',
            })
        });
};

export const resizer = (event, context, callback) => {
    // Parse path
    const path = event.path.substring('/resizer'.length);

    if (!path) {
        return callback(new Error('Path cannot be empty'));
    }

    return resizerPromise(event, context, path)
        .then(resp => callback(null, resp))
        .catch((err) => {
            console.error(err);
            if (err.isJoi) {
                return callback(null, {
                    statusCode: 400,
                    body: err.toString(),
                });
            }

            return callback(new Error('Parse error'));
        });
};
