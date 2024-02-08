require('dotenv').config({ override: true })
const request = require('supertest')
const { HOST = 'localhost', PORT } = process.env
const url = `${HOST}:${PORT}`

describe('Testing Auth endpoints', () => {
	let token
	const email = 'asami.mayuri1@gmail.com'
	const password = 'password'
	const name = 'Asami Mayuri'
	const newPassword = 'passwordNew'

	it('[Success] Register user', async () => {
		const res = await request(url).post('/api/auth/register').send({
			email,
			password,
			name,
			confirmPassword: password,
		})

		expect(res.statusCode).toEqual(201)
		expect(res.body).toHaveProperty('result')
		expect(res.body.result).toHaveProperty('token')
	})

	it('[Success] Login user', async () => {
		const res = await request(url).post('/api/auth/login').send({
			email: 'asami.mayuri1@gmail.com',
			password: 'password',
		})

		expect(res.statusCode).toEqual(200)
		expect(res.body.result).toHaveProperty('token')
		token = res.body.result.token

		expect(res.body.result).toHaveProperty('user')
		expect(res.body.result.user).not.toHaveProperty('password')

		expect(res.body.result.user).toHaveProperty('email')
		expect(res.body.result.user.email).toEqual(email)

		expect(res.body.result.user).toHaveProperty('name')
		expect(res.body.result.user.name).toEqual(name)
	})

	it('[Success] Get auth user', async () => {
		const res = await request(url).get('/api/auth').set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('result')

		expect(res.body.result).toHaveProperty('email')
		expect(res.body.result.email).toEqual(email)

		expect(res.body.result).toHaveProperty('name')
		expect(res.body.result.name).toEqual(name)
	})

	it('[Success] Reset password', async () => {
		const res = await request(url).patch('/api/auth/reset-password').set('Authorization', `Bearer ${token}`).send({
			password: newPassword,
			confirmPassword: newPassword,
		})

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('message')
		expect(res.body.message).toEqual('Password reset successfully')
	})
})