const Joi = require('joi')

const createSchema = Joi.object({
	name: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().required()
})

module.exports = { createSchema }