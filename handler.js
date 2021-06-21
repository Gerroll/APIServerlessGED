const S3Client = require('./utils/S3Client')
const DynamoBbClient = require('./utils/DynamoBbClient')
const FormData = require('./utils/FormData')
const HttpResponseUtils = require('./utils/HttpResponseUtils')
const { v4: uuidv4 } = require('uuid')

const bucketName = process.env.S3_BUCKET_ONE
const gedDirPathS3 = "ged/"
const tableName = "Document"


module.exports.getDocuments = async (event) => {
    const itemListDb = await DynamoBbClient.selectAll(tableName)

    const itemListJson = []

    // Convert s3 class to json format
    itemListDb.Items.forEach((object) => {
        itemListJson.push({
            "uuid": object.uuid.S,
            "fileName": object.fileName.S
        })
    })
    return HttpResponseUtils.getReponse(200, itemListJson)
}

module.exports.getDocumentWhereUuid = async (event) => {
    const pathParameters = event.pathParameters

    if (!('uuid' in pathParameters)) {
        console.log(pathParameters)
        return HttpResponseUtils.getReponseError(400, "Missing path parameter 'uuid'")
    }

    const uuid = pathParameters.uuid

    const item = await DynamoBbClient.selectWhereUuid(tableName, uuid)
    console.log("item")
    console.log(item)
    console.log("item")
    const url = S3Client.getSignedUrl(bucketName, item.Item.keyDocument.S)

    return HttpResponseUtils.getReponse(200, {
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
    })

    if (!fileParam) {
        return HttpResponseUtils.getReponseError(400, "Missing 'file' parameter")
    }

    const newUuid = uuidv4()
    const fileName = fileParam['filename']
    const keyDocument = gedDirPathS3 + fileName

    console.log(newUuid)
    console.log(fileName)
    console.log(keyDocument)

    const itemWhereFileName = await DynamoBbClient.scanWhereFileName(tableName, fileName)

    if (itemWhereFileName.Items.length > 0) {
        return HttpResponseUtils.getReponseError(400, "File already exist in BDD")
    }

    // DynamoDb Put
    var itemToAdd = {
        "uuid": {
            S: newUuid
        },
        "keyDocument": {
            S: keyDocument
        },
        "fileName": {
            S: fileName
        }
    }

    await DynamoBbClient.putItem(tableName, itemToAdd)

    // S3 Put
    await S3Client.putObject(bucketName, fileParam['file'], gedDirPathS3 + fileParam['filename'])

    return HttpResponseUtils.getReponse(201, {
        newDocument: {
            uuid: newUuid,
        }
    })
}
