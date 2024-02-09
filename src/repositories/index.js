class BaseRepository {
	constructor(model, transaction) {
		this.model = model
		this._transaction  = transaction
	}

	async countBy({ query, options }) {
		return await this.model.count({ ...options, where: query })
	}

	async deleteBy({ query }) {
		return await this.model.destroy({ where: query, transaction: this.transaction })
	}

	async getBy({ query, options }) {
		return await this.model.findOne({ ...options, where: query })
	}

	async getPagination({ query, options = {} }) {
		const { limit = '10', page: currentPage = '1', ...restOptions } = options
		const offset = limit * (parseInt(currentPage) - 1)

		const { count, rows } = await this.model.findAndCountAll({
			...restOptions,
			where: query,
			limit: parseInt(limit),
			offset,
		})

		return {
			data: rows,
			pagination: {
				total: count,
				limit: parseInt(limit),
				currentPage: parseInt(currentPage),
				totalPages: Math.ceil(count / limit),
			},
		}
	}

	async storeData(payload) {
		return await this.model.create(payload, { transaction: this.transaction })
	}

	async updateBy({ query, data }){
		return await this.model.update(data, { where: query, transaction: this.transaction })
	}

	set transaction(transaction) {
		this._transaction = transaction
	}

	get transaction() {
		return this._transaction
	}
}

module.exports = BaseRepository