const { InvariantError, NotFoundError, BadRequestError } = require('../libs/exceptions')
const { generateSlug } = require('../libs/helpers')
const CategoryRepository = require('../repositories/category')

class CategoryService {
	constructor(transaction) {
		this.categoryRepository = new CategoryRepository(transaction)
	}

	async createCategory(payload) {
		payload.slug = generateSlug(payload.name)

		const category = await this.categoryRepository.storeData(payload)
		if (!category) throw new InvariantError('Failed to create category')

		return category
	}

	async deleteCategoryBy({ query }) {
		if (!query.userId) throw new BadRequestError('User ID is required')

		return await this.categoryRepository.deleteBy({ query })
	}

	async getCategoryBy({ query, options = {} }) {
		return await this.categoryRepository.getBy({ query, options })
	}

	async getAndCountCategories({ query, options }) {
		return await this.categoryRepository.getPagination({ query, options })
	}

	async updateCategoryBy({ query, data }) {
		const category = await this.getCategoryBy({ query, options: { raw: true, include: [] } })
		if (!category) throw new NotFoundError('Category not found')

		return await this.categoryRepository.updateBy({ query, data })
	}

	setTransaction(transaction) {
		this.categoryRepository.transaction = transaction
	}
}

module.exports = CategoryService