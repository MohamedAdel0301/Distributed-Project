const express = require('express');
const router = express.Router();

const Restful = require('../controllers/Restful')

router.route('/api')
.get(Restful.getAllProducts)
.post(Restful.addProduct)

router.route('/api/:id')
.get(Restful.getProductById)
.patch(Restful.editProduct)
.delete(Restful.deleteProduct)

module.exports = router