const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

const exportStatement = (name, value) => name && value ? `export ${name}="${value}" && ` : '';

const dockerFile = `
FROM lambci/lambda:build-nodejs6.10

ADD . .

RUN ${exportStatement('aws_access_key_id', process.env.AWS_ACCESS_KEY_ID)} \\
${exportStatement('aws_secret_access_key', process.env.AWS_SECRET_ACCESS_KEY)} \\
${exportStatement('AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID)} \\
${exportStatement('AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY)} \\
${exportStatement('AWS_REGION', process.env.AWS_REGION)} \\
${exportStatement('SOURCE_S3_BUCKET_NAME', process.env.SOURCE_S3_BUCKET_NAME)} \\
${exportStatement('SOURCE_S3_WEBSITE', process.env.SOURCE_S3_BUCKET_URL)} \\
npm install && npm install serverless -g && sls deploy -v && exit 0
`;


const createDockerFile = () => new Promise((resolve, reject) => fs.writeFile('./Dockerfile', dockerFile, (err) => {
	if (err) {
		reject(err);
	}
	console.log('The temp Dockerfile was created! Please wait while we deploy your cdn...');
	resolve();
}));

const removeDockerFile = () => new Promise((resolve, reject) => fs.unlink('./Dockerfile', (err) => {
	if (err) {
		reject(err);
	}
	console.log('The temp Dockerfile was removed!');
	resolve();
}));

const runDockerFile = () => new Promise((resolve, reject) => {
	const dockerbuildDeploy = exec('docker build -t sls-zone-file-cdn .');
	dockerbuildDeploy.stderr.on('data', (data) => {
		console.error(`stderr: ${data}`);
	});
  dockerbuildDeploy.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
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
