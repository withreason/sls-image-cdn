# sls-image-cdn

This allows you to deploy a serverless image CDN with image resizing, processing and caching on AWS in a couple of easy steps.

It uses s3, s3 website hosting, api gateway, lambda and optionally cloud front.

## To deploy a simple s3 hosted non caching instance

### 1. prerequisits

- A working and running local docker deamon
- a cpp compiler. npm install will fail to compile the native image processor if you dont have this. 
It will however tell you what it needs to install. On a Mac you will need to have xcode installed.

### 1. Clone this repo and add your own config.

Config can be either added to a `.env` file, as system properties or a combination of both. 
The following settings need to be provided:

```
AWS_ACCESS_KEY_ID=YOURAWSAKID
AWS_SECRET_ACCESS_KEY=YOURAWSSAK
AWS_REGION='eu-west-1' # your aws region
SOURCE_S3_BUCKET_NAME=the-s3-dns-compat-bucket-name
```

## 2. install and deploy
```
npm install && npm run deploy
```

## 3. upload an image and test your CDN
TODO

## To deploy an s3 hosted cloud front cached instance (recommended)

### 1. prerequisits

- A working and running local docker deamon
- a cpp compiler. npm install will fail to compile the native image processor if you dont have this. 
It will however tell you what it needs to install. On a Mac you will need to have xcode installed.
- A hosted zone configured in AWS to add your cdn url to.
- A certificate in AWS certificate manager (MUST BE in us-east-1 region) to use for the cdn domain you wish to create.

### 1. Clone this repo and add your own config.

Config can be either added to a `.env` file, as system properties or a combination of both. 
The following settings need to be provided:

```
AWS_ACCESS_KEY_ID=YOURAWSAKID
AWS_SECRET_ACCESS_KEY=YOURAWSSAK
AWS_REGION='eu-west-1' # your aws region
CLOUD_FRONT_DOMAIN=your.cdn.dot.your.domain.name.com
CLOUD_FRONT_HOSTED_ZONE=your.domain.name.com. (NOTE trailing dot is important as its part of the hosted zone name)
CLOUD_FRONT_CERT_ARN=yourCertArn
```

## 2. install and deploy

Just a warning, its takes ages to initialize a cloudfront instance so this step takes a while...

```
npm install && npm run deploy
```

## 3. upload an image and test your CDN
TODO
