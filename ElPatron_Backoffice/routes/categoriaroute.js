const router = require('express').Router();
const CategoryController = require('../Controllers/categoriaController');

router.route('/Categoria')
    .post(CategoryController.createCategory) // to create new subordinate resources
    .get(CategoryController.get) // to retrieve resource representation/information only
    .delete(CategoryController.deleteCategory)
    .patch(CategoryController.editCategory);


router.route('/getCategory')
    .post(CategoryController.getCategory)




module.exports = router;