const FormDataError = require("./FormDataError")

class FormData {

    event
    dataList = {files: []}
    boundary = ""

    constructor(event) {
        this.event = event
        this.checkIfFormData()
        this.boundary = this.getBoundary()
        if (!this.boundary) {
            throw new FormDataError("Boundary information missing")
        }
        this.fetchAllDataInBody()
    }

    checkIfFormData() {
        let contentType = this.event.headers["Content-Type"]
        if (!contentType) {
            throw new FormDataError("Content type undefined")
        }
        const contentTypeArray = contentType.split(';').map(item => item.trim())
        if (contentTypeArray && contentTypeArray.length) {
            contentType = contentTypeArray[0]
        }

        if (!contentType) {
            throw new FormDataError("Content type not specified")
        }

        const multipartFormData = 'multipart/form-data'
        if (multipartFormData != contentType) {
            throw new FormDataError("Content type is not supported")
        }

    }

    fetchAllDataInBody() {
        const rawDataArray = this.event.body.split(this.boundary)
        for (let item of rawDataArray) {
            const data = new Data()
            // Use non-matching groups to exclude part of the this.dataList
            data.name = this.getMatching(item, /(?:name=")(.+?)(?:")/)
            if (!data.name || !(data.name = data.name.trim()))
                continue
    
            data.value = this.getMatching(item, /(?:\r\n\r\n)([\S\s]*)(?:\r\n--$)/)
            if (!data.value)
                continue
    
            let filename = this.getMatching(item, /(?:filename=")(.*?)(?:")/)
            if (filename && (filename = filename.trim())) {
                // Add the file information in a files array
                let file = {}
                file[data.name] = data.value
                file['filename'] = filename
                let contentType = this.getMatching(item, /(?:Content-Type:)(.*?)(?:\r\n)/)
                if (contentType && (contentType = contentType.trim())) {
                    file['Content-Type'] = contentType
                }
                if (!this.dataList.files) {
                    this.dataList.files = []
                }
                this.dataList.files.push(file)
            } else {
                // Key/Value pair
                this.dataList[data.name] = data.value
            }
        }
    }

    getBoundary() {
        let contentType = this.event.headers['Content-Type']
        const contentTypeArray = contentType.split(';').map(item => item.trim())
        const boundaryPrefix = 'boundary='
        let boundary = contentTypeArray.find(item => item.startsWith(boundaryPrefix))
        if (!boundary) return null
        boundary = boundary.slice(boundaryPrefix.length)
        if (boundary) boundary = boundary.trim()
        return boundary
    }

    getMatching(string, regex) {
        // Helper function when using non-matching groups
        const matches = string.match(regex)
        if (!matches || matches.length < 2) {
            return null
        }
        return matches[1]
    }
}

class Data {
    name
    value
    contentDisposition = ""
    contentType = ""
    fileContent = ""
}

module.exports = FormData