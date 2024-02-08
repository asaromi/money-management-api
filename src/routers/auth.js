const { Router } = require('express')
const { getAuthUser, login, register, resetPassword } = require('../controllers/auth')
const { validateSchema, handleResponse, authenticate } = require('../libs/middlewares')
const { createSchema: createUserSchema, resetPasswordSchema } = require('../validators/user')
const router = new Router()

router.get(
	'/',
	authenticate,
	getAuthUser,
	handleResponse,
)
router.post(
	'/login',
	login,
	handleResponse
)
router.post(
	'/register',
	validateSchema(createUserSchema),
	register,
	handleResponse,
)
router.patch(
	'/reset-password',
	authenticate,
	validateSchema(resetPasswordSchema),
	resetPassword,
	handleResponse,
)

module.exports = router