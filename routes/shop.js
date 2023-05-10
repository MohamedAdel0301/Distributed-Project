const path = require('path');

const express = require('express');
const isAuth = require('../public/js/is-auth');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart',shopController.getCart);

router.post('/cart',isAuth ,shopController.postCart);

router.post('/cart-delete-item',isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth,shopController.getOrders);

router.get('/orders/:orderId',isAuth,shopController.getInvoice)

router.get('/checkout',isAuth,shopController.getCheckout)

router.get('/checkout/success',shopController.postOrder)

router.get('/checkout/cancel/',shopController.getCheckout)

router.get('/search',shopController.getSearch)

module.exports = router;
