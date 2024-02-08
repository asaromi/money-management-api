const BaseRepository = require('./index')
const { Category } = require('../databases/models')

class CategoryRepository extends BaseRepository {
	constructor(transaction) {
		super(Category, transaction)
	}

	async getCategories({ query, options = {} }) {
		if (query) {
			options.where = query
		}

		return await this.model.findAll({ raw: true, ...options })
	}

	async deleteBy({ query }) {
		return await this.model.destroy({ where: query, transaction: this.transaction })
	}
}

module.exports = CategoryRepository