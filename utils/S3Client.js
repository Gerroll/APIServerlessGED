const AWS = require('aws-sdk')
const S3Error = require('./S3Error')

class S3Client {

    static s3 = new AWS.S3()

    static listItemInDir(bucketName, prefix, dir) {
        const paramsListObjectV2 = {
            Bucket: bucketName,
            Prefix: prefix,
            StartAfter: dir
        }
        return S3Client.s3.listObjectsV2(paramsListObjectV2, (err, data) => S3Client.callBackS3(err, data)).promise()
    }

    static getSignedUrl(bucketName, fileKey) {
        const paramsGetSignedUrl = {
            Bucket: bucketName,
            Key: fileKey,
            Expires: 300
        }
        return S3Client.s3.getSignedUrl('getObject', paramsGetSignedUrl)
    }

    static putObject(bucketName, body, key) {
        const paramsPutObject = {
            Body: body,
            Bucket: bucketName,
            Key: key
        }
        return S3Client.s3.putObject(paramsPutObject, (err, data) => S3Client.callBackS3(err, data)).promise()
    }

    static callBackS3(err, data) {
        if (err) {
            console.log(err, err.stack)
            throw new S3Error(err.message)
        }
    }

}

module.exports = S3Client