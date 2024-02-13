const { InvariantError } = require('./exceptions')
require('dotenv').config()

const debug = (...props) => {
	if (process.env.NODE_ENV !== 'development' || process.env.DEBUG !== 'true') {
		return ''
	}

	console.log(...props)
}

const debugError = (...props) => {
	if (process.env.NODE_ENV !== 'development' || process.env.DEBUG !== 'true') {
		return ''
	}

	console.error(...props)
}

const successResponse = ({ res, result, message, statusCode = 200 }) => {
	return res.status(statusCode).send({
		success: true,
		message,
		result,
	})
}

const errorResponse = ({ res, error = new InvariantError(), statusCode = 500 }) => {
	const { message, statusCode: code } = error

	debugError(error)
	return res.status(code || statusCode).send({
		success: false,
		message,
	})
}

module.exports = { debug, errorResponse, successResponse }
