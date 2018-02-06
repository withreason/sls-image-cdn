## 1. Setup Your Bucket

Once your bucket has been created, you will need to deploy the lambda make sure these are both accessible by the same IAM user as per setup in your AWS profile on your current machine.

## 2. Lambda and s3 CDN

Get this

```
serverless install -u [this]  --name [YOUR NAME HERE]
```

## 3. Deploy this

create a `.env` file with the following EV's
```
AWS_ACCESS_KEY_ID=YOURAWSAKID
AWS_SECRET_ACCESS_KEY=YOURAWSSAK
SOURCE_S3_BUCKET_NAME=the-s3-dns-compat-bucket-name
AWS_REGION='eu-west-1' # your aws region
```

```
npm run deploy
```

### 4. CORS rules (This should happen automatically)

Add CORS rules to your bucket if this had not happened automatically

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>Authorization</AllowedHeader>
</CORSRule>
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```

## 5. Static website hosting (This should happen automatically)

If your redirection rules are not added automatically, please setup your bucket to have static website hosting enabled, by default you will need to add index and error documents, even though these aren't used.

|key    |value  |
|---	|---	|
|Use this bucket to host a website |`yes`|
|Index document |`index.html`|
|Error document |`error.html`|

Add the following redirection rule to your bucket, replacing `YOUR_LAMBDA_URL.execute-api.YOUR_LAMBDA_REGION.amazonaws.com` with your lambda url.

```xml
<RoutingRules>
  <RoutingRule>
    <Condition>
      <HttpErrorCodeReturnedEquals>404</HttpErrorCodeReturnedEquals>
    </Condition>
    <Redirect>
      <Protocol>https</Protocol>
      <HostName>YOUR_LAMBDA_URL.execute-api.YOUR_LAMBDA_REGION.amazonaws.com</HostName>
      <ReplaceKeyPrefixWith>dev/resizer/</ReplaceKeyPrefixWith>
      <HttpRedirectCode>302</HttpRedirectCode>
    </Redirect>
  </RoutingRule>
</RoutingRules>
```

## 6. Signed upload

> TODO : Document this

## 7. Deploying changes

> ``` node deploy.js ```

If you are re-deploying the lambda, you will need to comment out the following in your serverless.yaml to prevent attempted re-creation of buckets

```
plugins:
  - create-s3-bucket-redirect
...
resources:
  Resources:
    SourceImageBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${env:SOURCE_S3_BUCKET_NAME}
        AccessControl: PublicRead
```

## 8. Multiple instances in the same AWS account

If you are deploying multiple instances within the same AWS account, you will need to rename `SourceImageBucketProd` in the `serverless.yaml` and `create-s3-bucket-redirect.js` to something unique