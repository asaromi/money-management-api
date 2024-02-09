const CategoryRepository = require('../repositories/category')


class CategoryService {
	constructor(transaction) {
		this.categoryRepository = new CategoryRepository(transaction)
	}

	async createCategory(payload) {
		payload.slug = payload.name.toLowerCase()
			.replace('&', 'and')
			.replaceAll(/ /g, '-')
		return this.categoryRepository.storeData(payload)
	}

	async deleteCategoryBy({ query }) {
		return this.categoryRepository.deleteBy({ query })
	}

	async getCategories({ query, options = {} }) {
		return this.categoryRepository.getCategories({ query, options })
	}

	async getCategoryBy({ slug }) {
		return this.categoryRepository.getBy({ query: { slug } })
	}

	async updateCategoryBy({ query, data }) {
		return this.categoryRepository.updateBy({ query, data })
	}

	setTransaction(transaction) {
		this.categoryRepository.transaction = transaction
	}
}

module.exports = CategoryService