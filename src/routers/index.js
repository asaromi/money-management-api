const { handleResponse } = require('../libs/middlewares')

const authRouter = require('./auth')
const categoryRouter = require('./category')
const walletRouter = require('./wallet')
const transactionRouter = require('./transaction')

const routers = (fastify, options, done) => {
	fastify.get('/', handleResponse)

	fastify.register(authRouter, { prefix: '/auth' })
	fastify.register(categoryRouter, { prefix: '/categories' })
	fastify.register(walletRouter, { prefix: '/wallets' })
	fastify.register(transactionRouter, { prefix: '/transactions' })

	done()
}

module.exports = routers