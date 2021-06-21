const AWS = require('aws-sdk')

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
        return DynamoBbClient.dynamodb.getItem(paramsWhereUuid, function (err, data) {
            if (err) console.log(err, err.stack)
            else console.log(data)
        }).promise()
    }

    static selectAll(tableName) {
        const paramsScan = {
            TableName: tableName
        }
        return DynamoBbClient.dynamodb.scan(paramsScan, function (err, data) {
            if (err) console.log(err, err.stack)
            else console.log(data)
        }).promise()
    }

    static putItem(tableName, item) {
        const paramsPutItem = {
            Item: item,
            TableName: tableName
        }
        return DynamoBbClient.dynamodb.putItem(paramsPutItem, function (err, data) {
            if (err) console.log(err, err.stack)
            else console.log(data)
        }).promise()
    }

    static describeTable(tableName) {
        const paramsDescribeTable = {
            TableName: tableName
        }
        return DynamoBbClient.dynamodb.describeTable(paramsDescribeTable, function (err, data) {
            if (err) console.log(err, err.stack)
            else console.log(data)
        }).promise()
    }

    static listTables() {
        return DynamoBbClient.dynamodb.listTables({}, function (err, data) {
            if (err) console.log(err, err.stack)
            else console.log("ici", data)
        })
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
        return DynamoBbClient.dynamodb.scan(params, function (err, data) {
            if (err) console.log(err, err.stack)
            else console.log(data)
        }).promise()
    }
}

module.exports = DynamoBbClient