const { setCache, getCache, destroyCache, isCacheConnected } = require('../libs/redis')
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
			await destroyCache('categories')
		}

		return category
	}

	async countCategories({ query }) {
		return this.categoryRepository.countBy({ query })
	}

	async deleteCategoryBy({ query }) {
		const category = await this.countCategories({ query })
		if (!category) return 0
		const redisKey = `categories:C-${query?.slug}`

		const deletePromises = [this.categoryRepository.deleteBy({ query })]
		if (isCacheConnected) {
			deletePromises.push(destroyCache(redisKey))
			deletePromises.push(destroyCache('categories'))
		}

		const [deleted] = await Promise.all(deletePromises)
		return deleted
	}

	async getCategoryBy({ query, options = {} }) {
		const redisKey = `categories:C-${query.slug}`

		const cached = await getCache(redisKey)
		if (cached) {
			return cached
		}

		const category = await this.categoryRepository.getBy({ query, options })
		if (category) {
			await setCache(redisKey, category)
		}

		return category
	}

	async getAndCountCategories({ query, options, redisKey }) {
		if (!redisKey) throw new InvariantError('Redis key is required')
		debug('Redis key:', redisKey)

		const cached = await redisClient.get(redisKey)
		if (cached) {
			return cached
		}

		const categories = await this.categoryRepository.getPagination({ query, options })
		await setCache(redisKey, categories)

		return categories
	}

	async updateCategoryBy({ query, data }) {
		const category = await this.getCategoryBy({ query, options: { raw: true } })
		const redisKey = `categories:C-${category.slug}`

		const updatePromises = [this.categoryRepository.updateBy({ query, data })]
		if (category.slug) {
			updatePromises.push(destroyCache(redisKey))
			updatePromises.push(destroyCache('categories'))
		}

		const [updated] = await Promise.all(updatePromises)
		return updated
	}

	setTransaction(transaction) {
		this.categoryRepository.transaction = transaction
	}
}

module.exports = CategoryService