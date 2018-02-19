const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

const envVars = [
	'aws_access_key_id',
	'aws_secret_access_key',
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'AWS_REGION',
	'AWS_CLIENT_TIMEOUT',
	'SOURCE_S3_BUCKET_NAME',
	'SOURCE_S3_WEBSITE',
	'CLOUD_FRONT_DOMAIN',
	'CLOUD_FRONT_HOSTED_ZONE',
	'CLOUD_FRONT_CERT_ARN',
	'CACHE_MAX_AGE'
];

const exportStatement = (name, value) => name && value ? `export ${name}="${value}" && ` : '';
const exportStatements = envVars.map(envVar => exportStatement(envVar, process.env[envVar.toUpperCase()])).join(' ');

const dockerFile = `
FROM lambci/lambda:build-nodejs6.10

ADD . .

RUN ${exportStatements} npm install && npm install serverless -g && sls deploy -v && exit 0
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
    console.log(data);
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
