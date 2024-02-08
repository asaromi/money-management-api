require('dotenv').config({ override: true })
const request = require('supertest')
const { HOST = 'localhost', PORT } = process.env

describe('Root checker Endpoint', () => {
	it('Hello World!', async () => {
		const res = await request(`${HOST}:${PORT}`).get('/api')
		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('message')
		expect(res.body.message).toEqual('Hello World!')
	})
})