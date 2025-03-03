const {
	changePassword,
	getAuthUser,
	generateTokenResetPassword,
	login,
	register,
} = require('../controllers/auth')
const {
	authenticate,
	validateSchema,
	wrapHandler,
} = require('../libs/middlewares')
const {
	changePasswordSchema,
	createSchema: createUserSchema,
	resetPasswordSchema,
} = require('../validators/user')

const authRouters = (fastify, options, done) => {
	fastify.get('/', ...wrapHandler(
		authenticate,
		getAuthUser,
	))
	fastify.post('/login', ...wrapHandler(
		login,
	))
	fastify.post('/register', ...wrapHandler(
		validateSchema(createUserSchema),
		register,
	))
	fastify.patch('/change-password/:token', ...wrapHandler(
		authenticate,
		validateSchema(changePasswordSchema),
		changePassword,
	))
	fastify.get('/reset-password', ...wrapHandler(
		validateSchema(resetPasswordSchema),
		generateTokenResetPassword,
	))

	done()
}

module.exports = authRouters