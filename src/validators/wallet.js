const Joi = require('joi')

const createOrUpdateSchema = Joi.object({
	userId: Joi.string().length(26).required(),
	name: Joi.string().required(),
})

module.exports = { createOrUpdateSchema }