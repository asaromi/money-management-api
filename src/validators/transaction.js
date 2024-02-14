const Joi = require('joi')
const { TRANSACTION_TYPES } = require('../libs/constant')

const createOrUpdateSchema = Joi.object({
	categoryId: Joi.string().length(26).required(),
	userId: Joi.string().length(26).required(),
	walletId: Joi.string().length(26).required(),
	description: Joi.string().allow(null),
	type: Joi.string().valid(...Object.values(TRANSACTION_TYPES)).allow(null),
	amount: Joi.number().required(),
	timestamp: Joi.number(),
})

module.exports = { createOrUpdateSchema }