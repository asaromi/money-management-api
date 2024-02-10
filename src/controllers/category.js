const { sequelize, Op, Sequelize } = require('../databases/models')
const { InvariantError } = require('../libs/exceptions')

const CategoryService = require('../services/category')
const categoryService = new CategoryService()

const storeCategory = async (req, res, next) => {
	const transaction = await sequelize.transaction()
	try {
		categoryService.setTransaction(transaction)
		if (req.error) throw req.error

		const category = await categoryService.createCategory(req.body)
		if (!category) throw new InvariantError('Failed to create category')
		await transaction.commit()

		req.result = category
		req.statusCode = 201
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		await transaction.rollback()
		req.error = error
	} finally {
		next()
	}
}

const getPaginationCategories = async (req, res, next) => {
	try {
		const { q: name, limit, page } = req.query

		let redisKey = 'categories'
		if (name || limit || page) {
			const queryParams = new URLSearchParams(req.query)
			redisKey += `:Q-${queryParams.toString()}`
		}

		let query
		const parseName = (name || '').toLowerCase().replaceAll(/ /g, '-')
		if (name) {
			query = {
				[Op.or]: [
					Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), {
						[Op.like]: `%${name.toLowerCase()}%`,
					}),
					{ slug: { [Op.like]: `%${parseName}%` } }
				]
			}
		}

		const options = {
			attributes: ['id', 'name', 'slug'],
			order: [
				['updatedAt', 'DESC'],
				['id', 'ASC']
			]
		}

		req.result = await categoryService.getAndCountCategories({ query, options, redisKey })
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	} finally {
		next()
	}
}

const getCategoryBySlug = async (req, res, next) => {
	try {
		const { slug } = req.params

		const category = await categoryService.getCategoryBy({ query: { slug } })
		if (!category) throw new InvariantError('Category not found')

		req.result = category
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	} finally {
		next()
	}
}

const updateCategoryById = async (req, res, next) => {
	const transaction = await sequelize.transaction()
	try {
		categoryService.setTransaction(transaction)
		if (req.error) throw req.error

		const { id } = req.params
		req.body.slug = req.body.name.toLowerCase().split(' ').join('-')
		const [updated] = await categoryService.updateCategoryBy({ query: { id }, data: req.body })
		if (!updated) throw new InvariantError('Failed to update category')

		await transaction.commit()
		req.message = 'Category updated successfully'
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		await transaction.rollback()
		categoryService.setTransaction(null)
		req.error = error
	} finally {
		next()
	}
}

const deleteCategoryById = async (req, res, next) => {
	const transaction = await sequelize.transaction()
	try {
		categoryService.setTransaction(transaction)
		if (req.error) throw req.error

		const { id } = req.params
		const category = await categoryService.deleteCategoryBy({ query: { id } })
		if (!category) throw new InvariantError('Failed to delete category')

		await transaction.commit()
		req.message = 'Category deleted successfully'
		req.statusCode = 200
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		await transaction.rollback()
		categoryService.setTransaction(null)
		req.error = error
	} finally {
		next()
	}
}

module.exports = { deleteCategoryById, getCategoryBySlug, getPaginationCategories, storeCategory, updateCategoryById }