const Joi = require('joi')

const changePasswordSchema = Joi.object({
	password: Joi.string().required(),
	confirmPassword: Joi.string().required().valid(Joi.ref('password'))
		.options({
			messages: {
				'any.only': '"confirmPassword": does not match with "password"',
			},
		}),
})

const createSchema = Joi.object({
	name: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().required(),
	confirmPassword: Joi.string().required().valid(Joi.ref('password'))
		.options({
			// give custom message
			messages: {
				'any.only': '"confirmPassword": does not match with "password"',
			},
		}),
})

const resetPasswordSchema = Joi.object({
	email: Joi.string().email().required(),
})

module.exports = { changePasswordSchema, createSchema, resetPasswordSchema }