const path = require('path');
const isAuth = require('../public/js/is-auth');
const express = require('express');
const moderatorController = require('../controllers/superAdmin')
const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product',isAuth ,adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth ,adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth ,adminController.getEditProduct);

router.post('/edit-product', isAuth ,adminController.postEditProduct);

router.post('/delete-product',isAuth , adminController.postDeleteProduct);

router.get('/info',isAuth,adminController.getInfo);

router.post("/info/addBalance",adminController.addBalance);

router.get("/moderation",moderatorController.getMod)

router.post('/moderation/users',moderatorController.postUsers)

module.exports = router;
