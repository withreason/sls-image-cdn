#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

const stage = process.argv[2];
const stageStatement = stage ? `--stage ${stage} ` : '';

const region = process.argv[3];
const regionStatement = region ? `--region ${region} ` : '';

const envVars = [
	'aws_access_key_id',
	'aws_secret_access_key',
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'AWS_REGION',
	'AWS_CLIENT_TIMEOUT',
	'SOURCE_S3_BUCKET_NAME',
	'SOURCE_S3_WEBSITE',
	'SOURCE_S3_BUCKET_DELETION_POLICY',
	'CLOUD_FRONT_DOMAIN',
	'CLOUD_FRONT_HOSTED_ZONE',
	'CLOUD_FRONT_CERT_ARN',
	'CACHE_MAX_AGE',
  'UPLOAD_AUTHORIZER_FILE',
  'UPLOAD_STORAGE_STRATEGY'
];

const exportStatement = (name, value) => name && value ? `export ${name}="${value}" && ` : '';
const exportStatements = envVars.map(envVar => exportStatement(envVar, process.env[envVar.toUpperCase()])).join(' ');

const dockerFile = `
FROM lambci/lambda:build-nodejs6.10

ADD . .

RUN ${exportStatements} npm install && ./node_modules/serverless/bin/serverless deploy -v ${stageStatement}${regionStatement}&& exit 0
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
    console.log('The temp Dockerfile could not be removed');
	} else {
    console.log('The temp Dockerfile was removed!');
  }
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
      reject(code);
    }
	});
});

createDockerFile().then(runDockerFile).then(removeDockerFile).then(() => {
	console.log('deployed');
}).catch((err) => {
    console.error(err);
    console.error('There was an error. tidying up now');
	  return removeDockerFile().then(() => { process.exit(1); })
});

process.on('SIGINT', () => {
	console.log('\nCTRL+C..? ok, bye');
	removeDockerFile().then(() => { process.exit(0); });
});
