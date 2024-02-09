const Joi = require('joi')

const createOrUpdateSchema = Joi.object({
	name: Joi.string().required(),
})

module.exports = { createOrUpdateSchema }