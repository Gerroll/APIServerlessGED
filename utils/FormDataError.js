class FormDataError extends Error {

    constructor(message) {
        super(message)
        this.name = "FormDataError"
    }
}

module.exports = FormDataError