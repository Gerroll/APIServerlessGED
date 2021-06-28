const AWS = require('aws-sdk')
const DynamoDbError = require('./DynamoDbError')

class DynamoBbClient {

    static dynamodb = new AWS.DynamoDB()

    static selectWhereUuid(tableName, uuid) {
        var paramsWhereUuid = {
            TableName: tableName,
            Key: {
                "uuid": {
                    S: uuid
                }
            }
        }
        return DynamoBbClient.dynamodb.getItem(paramsWhereUuid,(err, data) => DynamoBbClient.callBackDynamoDb(err, data)).promise()
    }

    static selectAll(tableName) {
        const paramsScan = {
            TableName: tableName
        }
        return DynamoBbClient.dynamodb.scan(paramsScan,(err, data) => DynamoBbClient.callBackDynamoDb(err, data)).promise()
    }

    static putItem(tableName, item) {
        const paramsPutItem = {
            Item: item,
            TableName: tableName
        }
        return DynamoBbClient.dynamodb.putItem(paramsPutItem,(err, data) => DynamoBbClient.callBackDynamoDb(err, data)).promise()
    }

    static describeTable(tableName) {
        const paramsDescribeTable = {
            TableName: tableName
        }
        return DynamoBbClient.dynamodb.describeTable(paramsDescribeTable,(err, data) => DynamoBbClient.callBackDynamoDb(err, data)).promise()
    }

    static listTables() {
        return DynamoBbClient.dynamodb.listTables({},(err, data) => DynamoBbClient.callBackDynamoDb(err, data)).promise()
    }

    static scanWhereFileName(tableName, fileName) {
        const params = {
            TableName: tableName,
            FilterExpression: "fileName = :f1",
            ExpressionAttributeValues: {
                ":f1": {
                    S: fileName
                }
            },
            ProjectionExpression: "fileName"
        }
        return DynamoBbClient.dynamodb.scan(params, (err, data) => DynamoBbClient.callBackDynamoDb(err, data)).promise()
    }

    static callBackDynamoDb(err, data) {
        if (err) {
            console.log(err, err.stack)
            throw new DynamoDbError(err)
        }
    }
}

module.exports = DynamoBbClient