require('dotenv').config({ override: true })
const request = require('supertest')
const CategoryService = require('../../src/services/category')

const categoryService = new CategoryService()
const { HOST = 'localhost', PORT } = process.env
const url = `${HOST}:${PORT}`


describe('Testing Categories endpoints', () => {
	let id, slug
	const name = 'New Category 7'
	const token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxaHBqbjJyejBnMW4zajExbnJoNDA1bmIxIiwiaWF0IjoxNzA4NjUwNzExLCJleHAiOjE3MDg3MzcxMTF9.IjkjhxXAbRLLf9Y6oxQGysaRzbEObk2jA-VBpsB3_SN5om5cpJl5SGVeER5bWmJznazits0Ai1CXSsNMSVeIHg"

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
		slug = exists.slug
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
		slug = exists.slug
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

	it('If all tests are successful, then the test case would be deleted with service method', async () => {
		try {
			const deleted = await categoryService.deleteCategoryBy({ query: { slug } })
			expect(deleted).toBe(1)
		} catch (error) {
			console.error(error)
		}
	})
})