const { handleResponse, onSendResponse, responseHandler } = require('../libs/middlewares')

const authRouter = require('./auth')
const categoryRouter = require('./category')
const walletRouter = require('./wallet')
const transactionRouter = require('./transaction')

const routers = (fastify, options, done) => {
	fastify.get('/', async(req, _res) => {
		req.message = 'Welcome to Money Management API'
	})
	fastify.register(authRouter, { prefix: '/auth' })
	fastify.register(categoryRouter, { prefix: '/categories' })
	fastify.register(walletRouter, { prefix: '/wallets' })
	fastify.register(transactionRouter, { prefix: '/transactions' })

	fastify.addHook('onSend', responseHandler)
	done()
}

module.exports = routers