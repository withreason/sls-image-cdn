
const buildPolicy = (event, userId, effect) => {
  const authResponse          = {};
  authResponse.principalId    = 'user';
  const policyDocument        = {};
  policyDocument.Version      = '2012-10-17'; // default version
  policyDocument.Statement    = [];
  const statementOne          = {};
  statementOne.Action         = 'execute-api:Invoke'; // default action
  statementOne.Effect         = effect;
  statementOne.Resource       = event.methodArn.split('/').slice(0, 2).join('/') + '/*/*';
  policyDocument.Statement[0] = statementOne;
  authResponse.policyDocument = policyDocument;
  authResponse.context        = { id: userId };
  return authResponse;
};

function uploadAuthorizer(event, context, callback){
  return callback(null, buildPolicy(event, event.authorizationToken, event.authorizationToken ? 'Allow' : 'Deny'));
}

module.exports.uploadAuthorizer = uploadAuthorizer;