const { errorResponse, successResponse } = require('../libs/response')
const { InvariantError } = require('../libs/exceptions')
const UserService = require('../services/user')
const { hashPassword, comparePassword } = require('../libs/bcrypt')
const { generateToken } = require('../libs/jwt')

const userService = new UserService()

const register = async (req, res, next) => {
	try {
		if (req.error) throw req.error

		const password = await hashPassword(req.body.password)
		const user = await userService.createUser({ ...req.body, password })
		if (!user) throw new InvariantError('Failed to create user')

		const token = await generateToken({ id: user.id })
		if (!token) throw new InvariantError('Failed to generate token')

		req.result = { token }
		req.message = 'User registered successfully'
		req.statusCode = 201
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	} finally {
		next()
	}
}

const login = async (req, res, next) => {
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
		req.message = 'User logged in successfully'
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	} finally {
		next()
	}
}

const getAuthUser = async (req, res, next) => {
	try {
		if (req.error) throw req.error

		const { user } = req
		req.result = user
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	} finally {
		next()
	}
}

module.exports = { getAuthUser, register, login }