const { sequelize, Op } = require('../databases/models')
const { InvariantError } = require('../libs/exceptions')

const CategoryService = require('../services/category')
const categoryService = new CategoryService()

const storeCategory = async (req, res, next) => {
	const transaction = await sequelize.transaction()
	try {
		categoryService.setTransaction(transaction)
		if (req.error) throw req.error

		const category = await categoryService.createCategory(req.body)

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

const getCategories = async (req, res, next) => {
	try {
		const { q: name } = req.query

		let query = {}
		if (name) query.name = { [Op.like]: `%${name}%` }
		else query = null

		const options = {
			attributes: ['id', 'name', 'slug'],
			order: [['createdAt', 'ASC']]
		}

		req.result = await categoryService.getCategories({ query, options })
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

		const category = await categoryService.getCategoryBy({ slug })
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

module.exports = { deleteCategoryById, getCategories, getCategoryBySlug, storeCategory, updateCategoryById }