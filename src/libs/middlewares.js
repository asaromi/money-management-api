const Joi = require('joi')
const { AuthError, BadRequestError, NotFoundError } = require('./exceptions')
const { verifyToken } = require('./jwt')
const { errorResponse, Response } = require('./response')
const UserService = require('../services/user')

const userService = new UserService()

const authenticate = async (req, _res) => {
	try {
		const authorization = req.headers.authorization || req.params.token
		if (!authorization) throw new AuthError('Token not found')

		const [type, token] = authorization.split(' ')
		const { id } = type === 'Bearer' && await verifyToken(token) || {}

		const user = await userService.getUserById(id, { raw: true })
		if (!user) throw new AuthError('User not found')

		req.user = user
	} catch (error) {
		req.error = new AuthError(error?.message || 'Failed to authenticate user')
	}
}

const responseHandler = (req, res, payload, done) => {
	const { error, message, result, statusCode: code } = req
	payload = new Response({ res, error, message, result, statusCode: code })

	done(error || null, JSON.stringify(payload))
}

const notFoundHandler = (req, res) => {
	const payload = errorResponse(new NotFoundError(`[${req.method}] Route ${req.url} Not Found`))
	return res.code(404).send(payload)
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

			if (!req.body) req.body = {}
			req[source].userId = userId
			const { error } = schema.validate(req[source])
			if (error) throw new BadRequestError(error.message)
		} catch (error) {
			req.error = error
		} finally {
			next()
		}
	}

const wrapHandler = (...handlers) => {
	const [handler, ...preHandler] = [...handlers.slice(-1), ...handlers.slice(0, -1)]
	const options = { preHandler }

	return [options, handler]
}

module.exports = {
	authenticate,
	responseHandler,
	notFoundHandler,
	validateSchema,
	validateAuthSchema,
	wrapHandler,
}
