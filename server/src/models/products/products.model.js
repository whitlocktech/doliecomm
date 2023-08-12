const productsDatabase = require('./products.mongo')
const axios = require('axios')
const cataegoriesDatabase = require('../categories/categories.mongo')
require('dotenv').config()

const DOLIBARR_URL = process.env.DOLIBARR_URL
const DOLAPIKEY = process.env.DOLAPIKEY

async function getProductsFromDolibarr() {
  try {
    const dolibarrResponse = await axios.get(`${DOLIBARR_URL}/products?DOLAPIKEY=${DOLAPIKEY}`)
    const dolibarrProducts = dolibarrResponse.data

    for (const product of dolibarrProducts) { 
      const existingProduct = await productsDatabase.findOne({ productId: product.id })

      if (existingProduct) { 
        existingProduct.status = product.status
        existingProduct.ref = product.ref
        existingProduct.name = product.label
        existingProduct.price = product.price
        existingProduct.description = product.description || ''
        existingProduct.stockCount = product.stock_reel
        existingProduct.createdAt = product.date_creation
        existingProduct.updatedAt = product.date_modification

        existingProduct.inStock = existingProduct.stockCount > 0

      } else {
        const newProduct = new productsDatabase({
          status: product.status,
          productId: product.id,
          ref: product.ref,
          name: product.label,
          price: product.price,
          description: product.description || '',
          stockCount: product.stock_reel,
          instock: product.stock_reel > 0,
          createdAt: product.date_creation,
          updatedAt: product.date_modification,
        })
        await newProduct.save()
      }
    }
  } catch (error) { 
    throw new Error(`Error getting products from Dolibarr: ${error.message}`)
  }
}

async function updateProductCategoriesFromDolibarr() {
  try {
    const products = await productsDatabase.find();
    for (const product of products) {
      const url = `${DOLIBARR_URL}/products/${product.productId}/categories?DOLAPIKEY=${DOLAPIKEY}`;
      console.log('Fetching categories for product:', url);

      try {
        const dolibarrResponse = await axios.get(url);
        const categoryIds = dolibarrResponse.data.map(category => category.id);

        if (categoryIds.length > 0) {
          const categories = await cataegoriesDatabase.find({ categoryId: { $in: categoryIds } });

          product.categories = categories;
          await product.save();
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`Product ${product.productId} not found in Dolibarr. Skipping.`);
        } else {
          throw new Error(`Error updating product categories from Dolibarr: ${error.message}`);
        }
      }
    }
  } catch (error) { 
    throw new Error(`Error updating product categories from Dolibarr: ${error.message}`);
  }
}

async function getAllProducts() {
  try {
    const products = await productsDatabase
      .find()
      .populate('categories')
      .exec()
    return products
  } catch (error) { 
    throw new Error(`Error getting all products: ${error.message}`)
  }
}
async function getProductsForSale() {
  try {
    const products = await productsDatabase
      .find({ status: '1', instock: true })
      .populate('categories')
      .exec()
    return products
  } catch (error) { 
    throw new Error(`Error getting products for sale: ${error.message}`)
  }
}

async function getProductsByCategory(categoryId) {
  try {
    const category = await cataegoriesDatabase.findOne({ categoryId })

    if (!category) { 
      throw new Error('Category not found')
    }

    const products = await productsDatabase
      .find({ categories: category._id, status: '1', instock: true })
      .populate('categories')
      .exec()
    return products
  } catch (error) { 
    throw new Error(`Error getting products by category: ${error.message}`)
  }
}

async function getProduct(productId) { 
  try {
    const product = await productsDatabase
      .findOne({ productId })
      .populate('categories')
      .exec()
    return product
  } catch (error) { 
    throw new Error(`Error getting product: ${error.message}`)
  }
}

module.exports = {
  getProductsFromDolibarr,
  updateProductCategoriesFromDolibarr,
  getAllProducts,
  getProductsForSale,
  getProductsByCategory,
  getProduct,
}