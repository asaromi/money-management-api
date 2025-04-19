const { InvariantError } = require('./exceptions')
exports.generateSlug = (text) => text.toString().toLowerCase()
	.replace('&', 'and')
	.replace(/\s+/g, '-')
	.replace(/[^\w-]+/g, '')

exports.errorHandler = (req, error) => {
	if (!(error instanceof Error)) {
		error = new InvariantError(error.message)
	}

	req.error = error
}

exports.successResponse = (req, result, code, message) => {
	req.result = result
	req.message = message
	req.statusCode = code || (result || message ? 200 : 204)
}