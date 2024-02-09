require('dotenv').config({ override: true })
const request = require('supertest')
const { HOST = 'localhost', PORT } = process.env
const url = `${HOST}:${PORT}`

describe('Testing Categories endpoints', () => {
	let id, slug
	const name = 'Zakat Profesi'
	const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxaHA1NjBocXgyeTBkeWQ5OWU4dnl3YmdkIiwiaWF0IjoxNzA3NDIzNTgyLCJleHAiOjE3MDc1MDk5ODJ9.Mn2qZY4hsgL3ImWD21LOBCJTeKEY-B2ly5MDdKCUMCMNdQOS1cTeC-fpLz8oTZj_483oMqQf4rjaE0E2KM0cxw'

	it('[Success] Create category', async () => {
		const res = await request(url).post('/api/categories').set('Authorization', `Bearer ${token}`).send({
			name
		})

		expect(res.statusCode).toEqual(201)
		expect(res.body).toHaveProperty('result')

		expect(res.body.result).toHaveProperty('name')
		expect(res.body.result.name).toEqual(name)

		expect(res.body.result).toHaveProperty('id')
		id = res.body.result.id

		expect(res.body.result).toHaveProperty('slug')
		expect(res.body.result.slug).toEqual(name.toLowerCase().replace('&', 'and').replaceAll(/ /g, '-'))
		slug = res.body.result.slug
	})

	it('[Success] Get categories', async () => {
		const res = await request(url).get('/api/categories')

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('result')

		expect(res.body.result).toHaveProperty('pagination')
		expect(res.body.result).toHaveProperty('data')
		expect(res.body.result.data).toBeInstanceOf(Array)

		const exists = res.body.result.data.find(category => category.id === id)
		expect(exists).toBeTruthy()
	})

	it('[Success] Get categories with search query', async () => {
		const res = await request(url).get(`/api/categories?q=${name}`)

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('result')

		expect(res.body.result).toHaveProperty('pagination')
		expect(res.body.result).toHaveProperty('data')
		expect(res.body.result.data).toBeInstanceOf(Array)

		const exists = res.body.result.data.find(category => category.id === id)
		expect(exists).toBeTruthy()
	})

	it('[Success] Get category by slug', async () => {
		const res = await request(url).get(`/api/categories/${slug}`)

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty('result')

		expect(res.body.result).toHaveProperty('id')
		expect(res.body.result.id).toEqual(id)

		expect(res.body.result).toHaveProperty('slug')
		expect(res.body.result.slug).toEqual(slug)
	})
})