const { sequelize, Op, Sequelize } = require('../configs/db/models')
const { InvariantError } = require('../libs/exceptions')

const CategoryService = require('../services/category')
const { resultSuccess, catchError } = require('../libs/helpers')
const categoryService = new CategoryService()

const storeCategory = async (req, res) => {
	const transaction = await sequelize.transaction()
	try {
		if (req.error) throw req.error

		categoryService.setTransaction(transaction)

		const category = await categoryService.createCategory(req.body)
		if (!category) throw new InvariantError('Failed to create category')

		await transaction.commit()
		resultSuccess(req, category, 201)
	} catch (error) {
		await transaction.rollback()
		catchError(req, error)
	}
}

const getPaginationCategories = async (req, res) => {
	try {
		const { q: name, limit, page } = req.query

		let query
		const parseName = (name || '').toLowerCase().replaceAll(/ /g, '-')
		if (name) {
			query = {
				[Op.or]: [
					Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), {
						[Op.like]: `%${name.toLowerCase()}%`,
					}),
					{ slug: { [Op.like]: `%${parseName}%` } },
				],
			}
		}

		const options = {
			attributes: ['id', 'name', 'slug'],
			order: [
				['updatedAt', 'DESC'],
				['id', 'ASC'],
			],
			limit,
			page,
		}

		const result = await categoryService.getAndCountCategories({
			query,
			options,
		})
		resultSuccess(req, result)
	} catch (error) {
		catchError(req, error)
	}
}

const getCategoryBySlug = async (req, res) => {
	try {
		const { slug } = req.params

		const category = await categoryService.getCategoryBy({ query: { slug } })
		if (!category) throw new InvariantError('Category not found')

		resultSuccess(req, category)
	} catch (error) {
		catchError(req, error)
	}
}

const updateCategoryById = async (req, res) => {
	const transaction = await sequelize.transaction()
	try {
		if (req.error) throw req.error

		categoryService.setTransaction(transaction)

		const { id } = req.params
		req.body.slug = req.body.name.toLowerCase().split(' ').join('-')

		const [updated] = await categoryService.updateCategoryBy({
			query: { id },
			data: req.body,
		})
		if (!updated) throw new InvariantError('Failed to update category')

		await transaction.commit()
		resultSuccess(req, null, 200, 'Category updated successfully')
	} catch (error) {
		await transaction.rollback()
		catchError(req, error)
	} finally {
		categoryService.setTransaction(null)
	}
}

const deleteCategoryById = async (req, res) => {
	const transaction = await sequelize.transaction()
	try {
		if (req.error) throw req.error

		categoryService.setTransaction(transaction)
		const { id } = req.params

		const category = await categoryService.deleteCategoryBy({ query: { id } })
		if (!category) throw new InvariantError('Failed to delete category')

		await transaction.commit()
		resultSuccess(req, null, 200, 'Category deleted successfully')
	} catch (error) {
		await transaction.rollback()
		catchError(req, error)
	}
}

module.exports = {
	deleteCategoryById,
	getCategoryBySlug,
	getPaginationCategories,
	storeCategory,
	updateCategoryById,
}