class AuthError extends Error {
	constructor(message, statusCode = 401) {
		super(message)
		this.name = 'AuthError'
		this.statusCode = statusCode
	}
}

class BadRequestError extends Error {
	constructor(message, statusCode = 400) {
		super(message)
		this.name = 'BadRequestError'
		this.statusCode = statusCode
	}
}

class ForbiddenError extends Error {
	constructor(message, statusCode = 403) {
		super(message)
		this.name = 'ForbiddenError'
		this.statusCode = statusCode
	}
}

class InvariantError extends Error {
	constructor(message, statusCode = 500) {
		super(message)
		this.name = 'InvariantError'
		this.statusCode = statusCode
	}
}

class NotFoundError extends Error {
	constructor(message, statusCode = 404) {
		super(message)
		this.name = 'NotFoundError'
		this.statusCode = statusCode
	}
}

module.exports = {
	AuthError,
	BadRequestError,
	ForbiddenError,
	InvariantError,
	NotFoundError,
}
