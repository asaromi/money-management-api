require('dotenv').config()

const debug = (...props) => {
	if (process.env.NODE_ENV !== 'development' || process.env.DEBUG !== 'true') {
		return ''
	}

	if (props[0] instanceof Error) {
		console.error(...props)
	} else {
		console.log(...props)
	}
}

const debugError = (...props) => {
	if (process.env.NODE_ENV !== 'development' || process.env.DEBUG !== 'true') {
		return
	}

	console.error(...props)
}

const successResponse = ({ result, message }) => {
	debug('[SUCCESS] Response:', message, result)
	return {
		success: true,
		message,
		result,
	}
}

const errorResponse = (error) => {
	const { message } = error ?? {}

	debugError('[ERROR] Response:', error)
	return {
		success: false,
		message,
		result: error || null
	}
}

class Response {
	constructor({ res, error, message, result, statusCode }) {
		this.statusCode = error?.statusCode || statusCode
		this.message = error?.message || message || null
		this.result = result || null
		this.reply = res
		this._error = error
		this._success = !error
		this.reply.header('Content-Type', 'application/json; charset=utf-8')

		debug({
			success: this._success,
			result: this.result,
			message: this.message,
			code: this.statusCode,
		})
		return this._success ? this.success : this.error
	}

	get success() {
		this.reply.code(this.statusCode ?? 200)
		const { message, result } = this
		return successResponse({ message, result })
	}

	get error() {
		this.reply.code(this.statusCode ?? 500)
		return errorResponse(this._error)
	}
}

module.exports = { debug, errorResponse, successResponse, Response }
