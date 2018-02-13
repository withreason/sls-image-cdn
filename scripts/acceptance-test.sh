#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: test:acceptance <stage> <region>"
  exit 1
fi

if [ -z "$2" ]; then
  echo "Usage: test:acceptance <stage> <region>"
  exit 1
fi

export AWS_REGION=$2

if [[ "$AWS_ACCESS_KEY_ID" == "" ]]; then
    echo "AWS_ACCESS_KEY_ID env var must be set"
  exit 1
fi

if [[ "$AWS_SECRET_ACCESS_KEY" == "" ]]; then
    echo "AWS_SECRET_ACCESS_KEY env var must be set"
  exit 1
fi

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

cd $DIR/..

if [ -f deploy.log ]; then
    rm deploy.log
fi

RM_LOG="rm deploy.log"
DEPLOY="./scripts/deploy.js $1 $2"
UNDEPLOY="./scripts/undeploy.js $1 $2"
BNAME="export SOURCE_S3_BUCKET_NAME=${1}.actest.sls.zone"
DP="export SOURCE_S3_BUCKET_DELETION_POLICY=Delete"
C_AUTH="export UPLOAD_AUTHORIZER_FILE=test/acceptance/custom-auth"
UNSET_C_AUTH="unset UPLOAD_AUTHORIZER_FILE"

${BNAME} && ${DP} && ${DEPLOY} | tee deploy.log && export API_ENDPOINT=$(cat deploy.log | grep 'ServiceEndpoint' | cut -d ' ' -f 2) && ${RM_LOG} && \
./node_modules/mocha/bin/mocha --timeout 60000 --compilers js:babel-core/register test/acceptance/upload-iam.spec.ac.js && \
export SLS_DEBUG=* && ${UNDEPLOY} && \
# TODO fix the issue with custom Authenticators where the webpack plugin is not including them
#${BNAME} && ${DP} && ${C_AUTH} && ${DEPLOY} | tee deploy.log && export API_ENDPOINT=$(cat deploy.log | grep 'ServiceEndpoint' | cut -d ' ' -f 2) && ${RM_LOG} && \
#./node_modules/mocha/bin/mocha --timeout 60000 --compilers js:babel-core/register test/acceptance/upload-custom-auth.spec.ac.js && \
#${UNDEPLOY} && ${UNSET_C_AUTH} \
echo 'ALL PASSED!!'
