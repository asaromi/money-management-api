require('dotenv').config({ override: true })
const request = require('supertest')
const { HOST = 'localhost', PORT } = process.env
const url = `${HOST}:${PORT}`

describe('Testing Wallets endpoints', () => {
	let id
	const name = 'Bibit Invesment'
	const newName = 'Pluang Investment'
	const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxaHA1NjBocXgyeTBkeWQ5OWU4dnl3YmdkIiwiaWF0IjoxNzA3NDIzNTgyLCJleHAiOjE3MDc1MDk5ODJ9.Mn2qZY4hsgL3ImWD21LOBCJTeKEY-B2ly5MDdKCUMCMNdQOS1cTeC-fpLz8oTZj_483oMqQf4rjaE0E2KM0cxw'

	it('[Success] Create wallet', async () => {
		const res = await request(url).post('/api/wallets').set('Authorization', `Bearer ${token}`).send({
			name
		})

		expect(res.statusCode).toEqual(201)
		expect(res.body).toHaveProperty('result')

		expect(res.body.result).toHaveProperty('name')
		expect(res.body.result.name).toEqual(name)

		expect(res.body.result).toHaveProperty('id')
		id = res.body.result.id
	})

	it('[Success] Get wallets', async () => {
		const res = await request(url).get('/api/wallets').set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('result')

		expect(res.body.result).toHaveProperty('pagination')
		expect(res.body.result).toHaveProperty('data')
		expect(res.body.result.data).toBeInstanceOf(Array)

		const exists = res.body.result.data.find(wallet => wallet.id === id)
		expect(exists).toBeTruthy()
	})

	it('[Success] Get wallet by id', async () => {
		const res = await request(url).get(`/api/wallets/${id}`).set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('result')

		expect(res.body.result).toHaveProperty('name')
		expect(res.body.result.name).toEqual(name)
	})

	it('[Success] Update wallet', async () => {
		const res = await request(url).put(`/api/wallets/${id}`).set('Authorization', `Bearer ${token}`).send({
			name: newName
		})

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('message')
		expect(res.body.message).toEqual('Wallet updated successfully')
	})

	it('[Success] Delete wallet', async () => {
		const res = await request(url).delete(`/api/wallets/${id}`).set('Authorization', `Bearer ${token}`)

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('message')
		expect(res.body.message).toEqual('Wallet deleted successfully')
	})
})