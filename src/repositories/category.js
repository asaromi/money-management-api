const BaseRepository = require('./index')
const { Category } = require('../configs/db/models')

class CategoryRepository extends BaseRepository {
	constructor(transaction) {
		super(Category, transaction)
	}
}

module.exports = CategoryRepository