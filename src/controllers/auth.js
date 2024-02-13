const { sequelize } = require('../databases/models')
const { hashPassword, comparePassword } = require('../libs/bcrypt')
const { InvariantError } = require('../libs/exceptions')
const { generateToken } = require('../libs/jwt')

const UserService = require('../services/user')
const { debug } = require('../libs/response')
const userService = new UserService()

const register = async (req, res) => {
	const transaction = await sequelize.transaction()

	try {
		userService.setTransaction(transaction)
		if (req.error) throw req.error

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
		req.result = { token }
		req.statusCode = 201
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		await transaction.rollback()
		userService.setTransaction(null)
		req.error = error
	}
}

const login = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { email, password: plainPassword } = req.body
		const { password, ...user } = await userService.getUserByEmail(email, { isLogin: true, raw: true })
		if (!user) throw new InvariantError('Invalid email')

		const isPasswordMatch = await comparePassword(plainPassword, password)
		if (!isPasswordMatch) throw new InvariantError('Password does not match')

		const token = await generateToken({ id: user.id })
		if (!token) throw new InvariantError('Failed to generate token')

		req.result = { user, token }
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

const getAuthUser = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { user } = req
		req.result = user
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

const resetPassword = async (req, res) => {
	const transaction = await sequelize.transaction()
	try {
		userService.setTransaction(transaction)
		if (req.error) throw req.error

		const { password: plainPassword } = req.body
		const password = await hashPassword(plainPassword)
		const [updated] = await userService.updateUserById(req.user.id, { password })
		if (!updated) throw new InvariantError('Failed to reset password')

		req.message = 'Password reset successfully'
		req.statusCode = 200
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		await transaction.rollback()
		userService.setTransaction(null)
		req.error = error
	}
}

module.exports = { getAuthUser, login, register, resetPassword }