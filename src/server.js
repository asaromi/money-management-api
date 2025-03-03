require('dotenv')
const cors = require('@fastify/cors')
const { InvariantError } = require('./libs/exceptions')
const { debug } = require('./libs/response')
const { notFoundHandler } = require('./libs/middlewares')
const registerRouter = require('./routers')

const fastify = require('fastify')()

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000
const allowUrls = [
	'http://api.portfolio.host',
	'http://localhost',
	'http://api.postman.host',
	'https://money-management-api-a2cf2b144c41.herokuapp.com',
]

fastify.register(cors, (_app) => {
	return (req, callback) => {
		let error = null
		const corsOptions = { origin: allowUrls }

		if (req.headers.origin && !allowUrls.includes(req.headers.origin)) {
			error = new InvariantError('Not allowed by CORS')
		}

		// do not include CORS headers for requests from localhost
		if (/^localhost$/m.test(req.headers.origin)) {
			corsOptions.origin = false
		}

		// callback expects two parameters: error and options
		callback(error, corsOptions)
	}
})

fastify.register(registerRouter, { prefix: '/api' })
fastify.setNotFoundHandler(notFoundHandler)

fastify.listen({ port, host }, async (err, address) => {
	if (err) {
		debug(err)
		fastify.log.error(err)
		process.exit(1)
	}

	debug(`Server is running on ${address}`)
})