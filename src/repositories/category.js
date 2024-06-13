const BaseRepository = require('./index')
const { Category } = require('../databases/models')

class CategoryRepository extends BaseRepository {
	constructor(transaction) {
		super(Category, transaction)
	}
}

module.exports = CategoryRepository