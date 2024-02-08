require('dotenv').config()

const debug = (...props) => {
	console.log(process.env.NODE_ENV, process.env.DEBUG)
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
	debug(statusCode)
	return res.status(statusCode).json({
		success: true,
		message,
		result,
	})
}

const errorResponse = ({ res, error = new Error(), statusCode = 500 }) => {
	const { message, statusCode: code } = error

	debugError(error)
	return res.status(code || statusCode).json({
		success: false,
		message,
	})
}

module.exports = { debug, errorResponse, successResponse }
