const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const FormData = require('./utils/FormData');
const FormDataError = require('./utils/FormDataError');

const bucketName = process.env.S3_BUCKET_ONE
const gedDirPathS3 = "ged/"


const { Readable } = require("stream")


module.exports.getDocuments = async (event) => {

  // Fetch only objects in starting with Prefix and exclud Dir with StartAfter params 
  let paramsListObjectV2 = {
    Bucket: bucketName,
    Prefix: gedDirPathS3,
    StartAfter: gedDirPathS3
  }

  // Fetch objects based on params given
  const objectListS3 = await s3.listObjectsV2(paramsListObjectV2, (err, data) => {
    if (err) return err
  }).promise()

  const objectGedList = []

  // Convert s3 class to json format
  objectListS3.Contents.forEach((object) => {
    objectGedList.push({
      "key": object.Key
    })
  })
  return JSON.stringify(objectGedList)


}

module.exports.getDocumentWhereUuid = async (event) => {
  const pathParameters = event.pathParameters

  if (!('uuid' in pathParameters)) {
    console.log(pathParameters)
    return JSON.stringify({
      err_msg: "Missing path parameter 'uuid'"
    })
  }

  const uuid = pathParameters.uuid
  const fileKey = gedDirPathS3 + uuid

  const paramsGetSignedUrl = {
    Bucket: bucketName,
    Key: fileKey,
    Expires: 300
  }

  const url = s3.getSignedUrl('getObject', paramsGetSignedUrl)

  return JSON.stringify({
    'signed_url': url
  })
}

module.exports.postDocument = async (event) => {

  let formData
  try {
    formData = new FormData(event)
  } catch (e) {
    if (e instanceof Error) {
      throw e
    }
    return JSON.stringify({
      err_msg: e.message
    })
  }

  // Fetch parameter 'file' send in form-data
  const fileParam = formData.dataList["files"].find(fileObj => {
    if (fileObj['file'])
      return true
    return false
  });

  if (!fileParam) {
    return JSON.stringify({
      err_msg: "Missing 'file' parameter"
    })
  }

  // Add object to S3
  const paramsPutObject = {
    Body: fileParam['file'], 
    Bucket: bucketName, 
    Key: gedDirPathS3 + fileParam['filename']
  }

  await s3.putObject(paramsPutObject, function (err, data) {
    if (err) {
      console.log(err)
    } else {
      console.log("Successfully uploaded")
    }
  })

  const newUuid = parseInt(Math.random() * 10000)

  return JSON.stringify({
    statusCode: 200,
    body: {
      newDocument: {
        uuid: newUuid,
      }
    },
  })
}
