require('dotenv').config({ override: true })
const cors = require('@fastify/cors')
const { redisClient } = require('./configs/redis')
const { InvariantError } = require('./libs/exceptions')
const registerRouter = require('./routers')
const { debug } = require('./libs/response')

const { HOST = 'localhost', PORT } = process.env
const fastify = require('fastify')()
const allowList = ['http://api.portfolio.host', 'http://localhost']

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

// fastify.register(require('fastify-formbody'))
fastify.register(registerRouter, { prefix: '/api' })

fastify.listen({ port: PORT, host: HOST }, async (err, address) => {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}

	await redisClient.connect()
	debug(`Server is running on ${address}`)
})