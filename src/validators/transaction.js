const Joi = require('joi')
const { TRANSACTION_TYPES } = require('../libs/constant')

const createSchema = Joi.object({
	categoryId: Joi.string().length(26).allow(null),
	userId: Joi.string().length(26).required(),
	walletId: Joi.string().length(26).required(),
	description: Joi.string().allow(null),
	type: Joi.string().valid(...Object.values(TRANSACTION_TYPES)).allow(null),
	amount: Joi.number().required(),
	timestamp: Joi.number(),
})

const updateSchema = Joi.object({
	categoryId: Joi.string().length(26).allow(null),
	userId: Joi.string().length(26).allow(null),
	walletId: Joi.string().length(26).allow(null),
	description: Joi.string().allow(null),
	type: Joi.string().valid(...Object.values(TRANSACTION_TYPES)).allow(null),
	amount: Joi.number().allow(null),
	timestamp: Joi.number().allow(null),
})

module.exports = { createSchema, updateSchema }