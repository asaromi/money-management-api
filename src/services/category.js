const { redisClient } = require('../configs/redis')
const { InvariantError } = require('../libs/exceptions')
const CategoryRepository = require('../repositories/category')
const { debug } = require('../libs/response')

class CategoryService {
	constructor(transaction) {
		this.categoryRepository = new CategoryRepository(transaction)
	}

	async createCategory(payload) {
		payload.slug = payload.name.toLowerCase()
			.replace('&', 'and')
			.replaceAll(/ /g, '-')

		const category = await this.categoryRepository.storeData(payload)
		if (category) {
			await redisClient.del('categories')
		}

		return category
	}

	async countCategories({ query }) {
		return this.categoryRepository.countBy({ query })
	}

	async deleteCategoryBy({ query }) {
		const category = await this.countCategories({ query })
		if (!category) return 0

		const isRedisConnected = redisClient.options.enableReadyCheck && redisClient.status === 'ready'
		const redisKey = `categories:C-${query?.slug}`

		const deletePromises = [this.categoryRepository.deleteBy({ query })]
		if (isRedisConnected) {
			deletePromises.push(redisClient.del(redisKey))
			deletePromises.push(redisClient.del('categories'))
		}

		const [deleted] = await Promise.all(deletePromises)
		return deleted
	}

	async getCategoryBy({ query, options = {} }) {
		const redisKey = `categories:C-${query.slug}`

		const cached = await redisClient.get(redisKey)
		if (cached) {
			return JSON.parse(cached)
		}

		const category = await this.categoryRepository.getBy({ query, options })
		if(category) {
			await redisClient.set(redisKey, JSON.stringify(category), { 'EX': 300 })
		}

		return category
	}

	async getAndCountCategories({ query, options, redisKey }) {
		if (!redisKey) throw new InvariantError('Redis key is required')
		debug('Redis key:', redisKey)

		const cached = await redisClient.get(redisKey)
		if (cached) {
			return JSON.parse(cached)
		}

		const categories = await this.categoryRepository.getPagination({ query, options })
		await redisClient.set(redisKey, JSON.stringify(categories), { 'EX': 300 })

		return categories
	}

	async updateCategoryBy({ query, data }) {
		const category = await this.getCategoryBy({ query, options: { raw: true } })
		const redisKey = `categories:C-${category.slug}`

		const updatePromises = [this.categoryRepository.updateBy({ query, data })]
		if (category.slug) {
			updatePromises.push(redisClient.del(redisKey))
			updatePromises.push(redisClient.del('categories'))
		}

		const [updated] = await Promise.all(updatePromises)
		return updated
	}

	setTransaction(transaction) {
		this.categoryRepository.transaction = transaction
	}
}

module.exports = CategoryService