const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

const dockerFile = `
FROM lambci/lambda:build-nodejs6.10

ADD . .

RUN export aws_access_key_id=${process.env.AWS_ACCESS_KEY_ID} && \\
export aws_secret_access_key=${process.env.AWS_SECRET_ACCESS_KEY} && \\
export AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID} && \\
export AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY} && \\
export SOURCE_S3_BUCKET_NAME="${process.env.SOURCE_S3_BUCKET_NAME}" && \\
export AWS_REGION='${process.env.AWS_REGION}' && \\
export SOURCE_S3_WEBSITE="${process.env.SOURCE_S3_BUCKET_URL}"  && \\
npm install && npm install serverless -g && sls deploy -v
exit 0
`;


const createDockerFile = () => new Promise((resolve, reject) => fs.writeFile('./Dockerfile', dockerFile, (err) => {
	if (err) {
		reject(err);
	}
	console.log('The temp Dockerfile was created! Please wait while we deploy your cdn ...');
	resolve();
            // docker build -t sls-zone-file-cdn . && docker run -it sls-zone-file-cdn
}));

const removeDockerFile = () => new Promise((resolve, reject) => fs.unlink('./Dockerfile', (err) => {
	if (err) {
		reject(err);
	}
	console.log('The temp Dockerfile was removed!');
	resolve();
}));

const runDockerFile = () => new Promise((resolve, reject) => {
	const dockerbuildDeploy = exec('docker build -t sls-zone-file-cdn . && docker run sls-zone-file-cdn');
    dockerbuildDeploy.stderr.on('data', (data) => {
		console.error(`stderr: ${data}`);
	});
    dockerbuildDeploy.on('close', (code) => {
		if (code === 0) {
			resolve();
		} else {
			console.error(`child process exited with code ${code}`);
			reject();
		}
	});
});

createDockerFile().then(runDockerFile).then(removeDockerFile).then(() => {
	console.log('deployed');
}).catch((err) => {
    console.error(err);
    console.error('There was an error. tidying up now');
	removeDockerFile();
});

process.on('SIGINT', () => {
	console.log('\nCTRL+C..? ok, bye');
	removeDockerFile().then(() => { process.exit(0); });
});
