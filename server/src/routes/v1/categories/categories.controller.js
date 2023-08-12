const {
  getAllCategories,
  getCategory,
} = require('../../../models/categories/categories.model')

async function getAllCategoriesController(req, res) {
    try {
        const categories = await getAllCategories()

        res.status(200).json(categories)
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}
async function getCategoryController(req, res) { 
  try {
    const { categoryId } = req.params
    const category = await getCategory(categoryId)

    res.status(200).json(category)
  } catch (error) { 
    throw new Error(`Error getting category controller: ${error.message}`)
  }
}

module.exports = {
  getAllCategoriesController,
  getCategoryController,
}