class HttpResponseUtils {

    static getReponse(statusCode, body) {
        return {
            statusCode: statusCode,
            headers: {},
            body: JSON.stringify(body)
        }
    }

    static getReponseError(statusCode, errMsg) {
        return {
            statusCode: statusCode,
            headers: {},
            body: JSON.stringify({
                error: errMsg
            })
        }
    }
}

module.exports = HttpResponseUtils