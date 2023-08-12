const categoriesDatabase = require('./categories.mongo');
const axios = require('axios');
require('dotenv').config();

const DOLIBARR_URL = process.env.DOLIBARR_URL;
const DOLAPIKEY = process.env.DOLAPIKEY;

async function getCategoriesFromDolibarr() {
  try {
    const dolibarrResponse = await axios.get(`${DOLIBARR_URL}/categories?DOLAPIKEY=${DOLAPIKEY}`);
    const dolibarrCategories = dolibarrResponse.data;

    for (const category of dolibarrCategories) {
      const existingCategory = await categoriesDatabase.findOne({ categoryId: category.id });

      if (existingCategory) {
        existingCategory.name = category.label;
        existingCategory.description = category.description || '';
        existingCategory.parentCategoryId = category.fk_parent || null;
        await existingCategory.save();
      } else {
        const newCategory = new categoriesDatabase({
          categoryId: category.id,
          name: category.label,
          description: category.description || '',
          parentCategoryId: category.fk_parent || null,
        });
        await newCategory.save();
      }
    }
  } catch (error) {
    throw new Error(`Error getting categories from Dolibarr: ${error.message}`);
  }
}

async function updateParentCategories() {
  try {
    const categories = await categoriesDatabase.find();

    for (const category of categories) {
      if (category.parentCategoryId) {
        const parentCategory = await categoriesDatabase.findOne({ categoryId: category.parentCategoryId });
        if (parentCategory) {
          category.parentCategory = parentCategory._id;
          await category.save();
        }
      }
    }
  } catch (error) {
    throw new Error(`Error updating parent categories: ${error.message}`);
  }
}

async function addChildCategories() {
  try {
    const categories = await categoriesDatabase.find();

    for (const category of categories) {
      if (category.parentCategoryId) {
        const parentCategory = await categoriesDatabase.findOne({ categoryId: category.parentCategoryId });

        if (parentCategory) {
          if (!parentCategory.childCategories.includes(category._id)) {
            parentCategory.childCategories.push(category._id);
            await parentCategory.save();
          }
        }
      }
    }

    console.log('Child categories added successfully.');
  } catch (error) {
    console.error('Error adding child categories:', error.message);
  }
}

async function dolibarrCategoriesSync() {
  try {
    await getCategoriesFromDolibarr();
    await updateParentCategories();
    await addChildCategories();
  } catch (error) {
    throw new Error(`Error syncing and updating categories with Dolibarr: ${error.message}`);
  }
}

async function getAllCategories() {
  try {
    const categories = await categoriesDatabase.find()
      .populate('childCategories')
      .populate('parentCategory')
      .exec();
    return categories;
  } catch (error) {
    throw new Error(`Error getting all categories with children: ${error.message}`);
  }
}

async function getCategory(categoryId) {
  try {
    const category = await categoriesDatabase.findOne({ categoryId: categoryId })
      .populate({
        path: 'childCategories',
        populate: {
          path: 'childCategories',
          populate: {
            path: 'childCategories',
            populate: {
              path: 'childCategories',
            },
          },
        },
      })
      .exec()
    return category
  } catch (error) { 
    throw new Error(`Error getting category: ${error.message}`)
  }
}


module.exports = {
  dolibarrCategoriesSync,
  getAllCategories,
  getCategory,
};
