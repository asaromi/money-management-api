require('dotenv').config({ override: true })
const cors = require('@fastify/cors')
const { InvariantError } = require('./libs/exceptions')
const registerRouter = require('./routers')
const { debug } = require('./libs/response')

const fastify = require('fastify')()

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

const allowList = ['http://api.portfolio.host', 'http://localhost', 'http://api.postman.host', 'https://money-management-api-a2cf2b144c41.herokuapp.com/']
fastify.register(cors, (instance) => {
	return (req, callback) => {
		let error = null
		const corsOptions = {
			origin: allowList,
		}

		if (req.headers.origin && !allowList.includes(req.headers.origin)) {
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

fastify.listen({ port, host }, async (err, address) => {
	if (err) {
		debug(err)
		fastify.log.error(err)
		process.exit(1)
	}

	debug(`Server is running on ${address}`)
})