class DynamoDbError extends Error {

    constructor(message) {
        super(message)
        this.name = "DynamoDbError"
    }
}

module.exports = DynamoDbError