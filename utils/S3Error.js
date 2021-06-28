class S3Error extends Error {

    constructor(message) {
        super(message)
        this.name = "S3Error"
    }
}

module.exports = S3Error