class BaseRepository {
	constructor(model, transaction) {
		this.model = model
		this._transaction  = transaction
	}

	async countData({ query, options }) {
		return await this.model.count({ ...options, where: query })
	}

	async getBy({ query, options }) {
		return await this.model.findOne({ ...options, where: query })
	}

	async getPagination({ query, options = {} }) {
		const { limit = '10', page: currentPage = '1' } = query
		const offset = limit * (parseInt(currentPage) - 1)

		const { count, rows } = await this.model.findAndCountAll({
			...options,
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

	async saveModel(model) {
		await model.save()
	}

	async storeData(payload) {
		return await this.model.create(payload, { transaction: this.transaction })
	}

	generateModel(data) {
		return new this.model(data)
	}

	set transaction(transaction) {
		this._transaction = transaction
	}

	get transaction() {
		return this._transaction
	}
}

module.exports = BaseRepository