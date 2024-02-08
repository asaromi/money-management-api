const { Router } = require('express')
const { getAuthUser, login, register } = require('../controllers/auth')
const { validateSchema, handleResponse, authenticate } = require('../libs/middlewares')
const { createSchema: createUserSchema } = require('../validators/user')
const router = new Router()

router.get('/',
	authenticate,
	getAuthUser,
	handleResponse,
)
router.post('/register',
	validateSchema(createUserSchema),
	register,
	handleResponse,
)
router.post('/login', login, handleResponse)

module.exports = router