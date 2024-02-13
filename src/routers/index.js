const { handleResponse } = require('../libs/middlewares')

const authRouter = require('./auth')
const categoryRouter = require('./category')
const walletRouter = require('./wallet')

const routers = (fastify, options, done) => {
	fastify.get('/', handleResponse)

	fastify.register(authRouter, { prefix: '/auth' })
	fastify.register(categoryRouter, { prefix: '/categories' })
	fastify.register(walletRouter, { prefix: '/wallets' })

	done()
}

module.exports = routers