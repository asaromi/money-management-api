const { sequelize } = require('../configs/db/models')
const { hashPassword, comparePassword } = require('../libs/bcrypt')
const { InvariantError, NotFoundError } = require('../libs/exceptions')
const { resultSuccess, catchError } = require('../libs/helpers')
const { generateToken } = require('../libs/jwt')
const { debug } = require('../libs/response')
const UserService = require('../services/user')

const userService = new UserService()

const register = async (req, _res) => {
	const transaction = await sequelize.transaction()
	try {
		if (req.error) throw req.error

		userService.setTransaction(transaction)
		debug('Registering user', req.body)

		const [password, countUser] = await Promise.all([
			hashPassword(req.body.password),
			userService.countUsers({ query: { email: req.body.email } }),
		])

		if (countUser > 0) throw new InvariantError('Email already exists')

		const user = await userService.createUser({ ...req.body, password })
		if (!user) throw new InvariantError('Failed to create user')

		const token = await generateToken({ id: user.id })
		if (!token) throw new InvariantError('Failed to generate token')

		await transaction.commit()
		resultSuccess(req, { user, token }, 201)
	} catch (error) {
		await transaction.rollback()
		catchError(req, error)
	}
}

const login = async (req, _res) => {
	try {
		if (req.error) throw req.error

		const { email, password: plainPassword } = req.body
		const { password, ...user } = await userService.getUserByEmail(email, { isLogin: true, raw: true }) || {}
		if (!password && !user?.id) throw new NotFoundError('User not found')

		const isPasswordMatch = await comparePassword(plainPassword, password)
		if (!isPasswordMatch) throw new InvariantError('Password does not match')

		const token = await generateToken({ id: user.id })
		if (!token) throw new InvariantError('Failed to generate token')

		resultSuccess(req, { user, token })
	} catch (error) {
		catchError(req, error)
	}
}

const getAuthUser = async (req, _res) => {
	try {
		if (req.error) throw req.error

		const { user } = req
		resultSuccess(req, user)
	} catch (error) {
		catchError(req, error)
	}
}

const changePassword = async (req, _res) => {
	const transaction = await sequelize.transaction()
	try {
		if (req.error) throw req.error
		userService.setTransaction(transaction)

		const { password: plainPassword } = req.body
		const password = await hashPassword(plainPassword)
		const [updated] = await userService.updateUserById(req.user.id, { password })
		if (!updated) throw new InvariantError('Failed to reset password')

		await transaction.commit()
		resultSuccess(req, null, 200, 'Password changed successfully')
	} catch (error) {
		await transaction.rollback()
		catchError(req, error)
	}
}

const generateTokenResetPassword = async (req, _res) => {
	try {
		if (req.error) throw req.error

		const { email } = req.body
		const user = await userService.getUserByEmail(email, { raw: true })
		if (!user) throw new NotFoundError('User not found')

		const token = await generateToken({ id: user.id }, '1h')
		if (!token) throw new InvariantError('Failed to generate token')

		resultSuccess(req, { token })
	} catch (error) {
		catchError(req, error)
	}
}

module.exports = { changePassword, getAuthUser, generateTokenResetPassword, login, register }