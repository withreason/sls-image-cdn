#!/usr/bin/env node
const { exec } = require('child_process');
require('dotenv').config();

const stage = process.argv[2];
const stageStatement = stage ? `--stage ${stage} ` : '';

const region = process.argv[3];
const regionStatement = region ? `--region ${region} ` : '';


const runUndeploy = () => new Promise((resolve, reject) => {
	const removeCmd = exec(`./node_modules/serverless/bin/serverless remove ${stageStatement}${regionStatement}`);
  removeCmd.stderr.on('data', (data) => {
		console.error(`stderr: ${data}`);
	});
  removeCmd.stdout.on('data', (data) => {
    console.log(data);
  });
  removeCmd.on('close', (code) => {
		if (code === 0) {
      resolve();
    } else {
      console.error(`child process exited with code ${code}`);
      reject(code);
    }
	});
});

runUndeploy().then(() => {
	console.log('undeployed');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
