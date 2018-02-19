class CreateS3BucketRedirect {
  constructor(serverless, options) {
    this.hooks = {
      // this is where we declare the hook we want our code to run
      'after:deploy:finalize': () => { this.run(serverless) },
    }
  }
  run(serverless) {
    const lambdaFunctionName = 'resizer'
    const stage = serverless.service.provider.stage

    let apiGatewayEndpoint = null

    serverless.pluginManager.plugins.forEach((plugin) => {
      if (plugin.constructor.name === 'AwsInfo') {
        apiGatewayEndpoint = plugin.gatheredData.info.endpoint
      }
    })
    if (!apiGatewayEndpoint) {
      console.error(`
        Could not find the apiGatewayEndpoint under serverless.pluginManager.plugins[filter=class[AwsInfo]].gatheredData.info.endpoint,
        it might be due-to breaking changes in the Serverless.
      `)
    }
    apiGatewayEndpoint = apiGatewayEndpoint
      .substring('https://'.length, apiGatewayEndpoint.length - (stage.length + 1));

    const redirectToHost = serverless.service.custom.cloudFrontDomain || apiGatewayEndpoint;
    const stagePrefix = serverless.service.custom.cloudFrontDomain ? '' : `${stage}/`;
    const redirectToPath = `${stagePrefix}${lambdaFunctionName}/`

    const s3 = new serverless.providers.aws.sdk.S3()

    const params = {
      Bucket: serverless.service.custom.bucketName,
      WebsiteConfiguration: {
        ErrorDocument: {
          Key: 'error.html',
        },
        IndexDocument: {
          Suffix: 'index.html',
        },
        RoutingRules: [
          {
            Redirect: {
              HttpRedirectCode: '302',
              HostName: redirectToHost,
              ReplaceKeyPrefixWith: redirectToPath,
              Protocol: 'https',
            },
            Condition: {
              HttpErrorCodeReturnedEquals: '404',
            },
          },
        ],
      },
    }

    console.log(JSON.stringify(params))
    s3.putBucketWebsite(params, (err, data) => {
      if (err) {
        console.log(err, err.stack) // an error occurred
      } else {
        console.log(data) // successful response
      }
    })
  }
}

// now we need to make our plugin object available to the framework to execute
module.exports = CreateS3BucketRedirect
