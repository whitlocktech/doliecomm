const {
  getAllProducts,
  getProductsForSale,
  getProductsByCategory,
  getProduct,
} = require('../../../models/products/products.model')

async function getAllProductsController(req, res) { 
    try {
        const products = await getAllProducts()
        res.status(200).json(products)
    } catch (error) { 
        res.status(500).json({ message: error.message })
    }
}

async function getProductsForSaleController(req, res) {
  try {
    const products = await getProductsForSale()
    res.status(200).json(products)
  } catch (error) { 
    res.status(500).json({ message: error.message })
  }
}

async function getProductsByCategoryController(req, res) {
  try {
    const { categoryId } = req.params
    const products = await getProductsByCategory(categoryId)
    res.status(200).json(products)
  } catch (error) { 
    res.status(500).json({ message: error.message })
  }
}

async function getProductController(req, res) { 
  try {
    const { productId } = req.params
    const product = await getProduct(productId)
    res.status(200).json(product)
  } catch (error) { 
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getAllProductsController,
  getProductsForSaleController,
  getProductsByCategoryController,
  getProductController,
}