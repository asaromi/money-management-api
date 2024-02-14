const Joi = require('joi')
const { AuthError, ForbiddenError, BadRequestError } = require('./exceptions')
const { verifyToken } = require('./jwt')
const { errorResponse, debug, successResponse } = require('./response')
const UserService = require('../services/user')

const userService = new UserService()

const authenticate = async (req, res) => {
	try {
		const { authorization } = req.headers
		if (!authorization) throw new AuthError('Token not found')

		const [type, token] = authorization.split(' ')
		const { id } = type === 'Bearer' && await verifyToken(token) || {}

		const user = await userService.getUserById(id, { raw: true })
		if (!user) throw new AuthError('User not found')

		req.user = user
	} catch (error) {
		req.error = error
	}
}

const handleResponse = (req, res) => {
	const { error, result, statusCode: code } = req
	let message = !req.message && !result && 'Hello World!' || req.message

	if (error instanceof Error) {
		return errorResponse({ res, error: req.error })
	}

	return successResponse({ res, message, statusCode: code || 200, result })
}

const validateSchema = (schema = Joi.object(), source = 'body') =>
	(req, res, next) => {
		try {
			const { error } = schema.validate(req[source])
			if (error) throw new BadRequestError(error.message)
		} catch (error) {
			req.error = error
		} finally {
			next()
		}
	}

const validateAuthSchema = (schema = Joi.object(), source = 'body') =>
	(req, res, next) => {
		try {
			const { id: userId } = req.user
			if (!userId) throw new AuthError('Cannot validate user')

			req[source].userId = userId
			const { error } = schema.validate(req[source])
			if (error) throw new BadRequestError(error.message)
		} catch (error) {
			req.error = error
		} finally {
			next()
		}
	}

module.exports = { authenticate, handleResponse, validateSchema, validateAuthSchema }
