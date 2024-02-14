const { getAuthUser, login, register, resetPassword } = require('../controllers/auth')
const { authenticate, handleResponse, validateSchema, wrapHandler } = require('../libs/middlewares')
const { createSchema: createUserSchema, resetPasswordSchema } = require('../validators/user')

const authRouters = (fastify, options, done) => {
	fastify.get('/', ...wrapHandler(
		authenticate,
		getAuthUser,
		handleResponse
	))
	fastify.post('/login', ...wrapHandler(
		login,
		handleResponse
	))
	fastify.post('/register', ...wrapHandler(
		validateSchema(createUserSchema),
		register,
		handleResponse
	))
	fastify.patch('/reset-password', ...wrapHandler(
		authenticate,
		validateSchema(resetPasswordSchema),
		resetPassword,
		handleResponse
	))

	done()
}

module.exports = authRouters