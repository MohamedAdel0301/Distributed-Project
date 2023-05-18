const stripe = require('stripe')('sk_test_51N2vVdGHFd0rkFCf0UNQ0ml1oGcgOl7HcQHzDHOmVwNu0YckbkCUr3CavYeHwuHwhViMTvxDHdAwnag8NCzm4w7o00ISs5kFL5');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const helper = require('../util/helper');
const Product = require('../models/product');
const Order = require('../models/order');
const Cart = require('../models/cart')
const User = require('../models/user')


const itemsPP = 2;

//
exports.getProducts = (req, res, next) => {
  let page = 1*req.query.page||1;
  let totalItems;
  Product.count()
  .then(productCount=>{
    totalItems=productCount
    return Product.findAll({limit:itemsPP,offset:(page-1)*itemsPP})
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      currentPage: page,
      hasNextPage: itemsPP * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / itemsPP)
    });
  })
    .catch(err => {console.log(err);});
};
//
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};
//
exports.getIndex = (req, res, next) => {
  let page = 1*req.query.page||1;
  let totalItems;
  Product.count()
  .then(productCount=>{
    totalItems=productCount
    return Product.findAll({limit:itemsPP,offset:(page-1)*itemsPP})
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: itemsPP * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / itemsPP)
    });
  })
  .catch(err => {
    console.log(err);
  });
};
//
exports.getCart = (req, res, next) => {
  let message = req.flash('error');
  if (message) {
    message = message[0];
  } else {
    message = null;
  }
  User.findByPk(req.session.user.id).then(user => {
    return user;
  }).then(user => {
    return user.getCart();
  }).then(cart => {
    return cart.getProducts();
  }).then(products => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products,
      errorMessage:message
    });
  }).catch(err => {console.log(err)})
};
//
exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  User.findByPk(req.session.user.id).then(user => {
    return user;
  }).then(user => {
    return user.getCart();
  }).then(cart => {
    fetchedCart = cart;
    return cart.getProducts({ where: { id: productId } });
  }).then(products => {
    
    let product = (products.length > 0) ? products[0] : null;
    if (product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
    }
    return Product.findByPk(productId);

  }).then(prod => {
    return fetchedCart.addProduct(prod, { through: { quantity: newQuantity } });
  }).then(result => {
    res.redirect('/cart');
  }).catch(err => {console.log(err)});
};



//
exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  
  User.findByPk(req.session.user.id).then(user => {
    return user;
  }).then(user => {
    return user.getCart();
  }).then(cart => {
    return cart.getProducts({where: {id: productId}});
  }).then(products => {
    const product = products[0];
    return product.cartItem.destroy();
  }).then(result => {
    res.redirect('/cart');
  }).catch(err => {console.log(err)});
};
//
exports.postOrder = (req, res, next) => {
  let cartProducts;
  let fetchedCart;
  let currentUser;
  let currentBalance;
  let total = 0;
  User.findByPk(req.session.user.id).then(user => {
    currentUser = user;
    currentBalance = user.balance;
    return user;
  })
  .then(user => {
    return user.getCart();
  })
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts();
  })
  .then(products => {
    products.forEach(element => {
      total += element.price * element.cartItem.quantity;
    });
    if(currentBalance<total){
      req.flash('error', 'Balance is too low');
      return res.redirect('/cart');
    }
    else{
      currentUser.balance = currentUser.balance-total;
      currentUser.save()
      .then(user=>{
        cartProducts = products;
        return currentUser.createOrder()
        .then(order => {
          return order.addProducts(cartProducts.map(product => {
            product.orderItem = { quantity: product.cartItem.quantity };
            return product;
          }));
        }).then(result => {
          return fetchedCart.setProducts(null);
        }).then(result => {
          res.redirect('/orders');
        }).catch(err => {console.log(err)});
      })
    }
  })
}
//
exports.getOrders = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  User.findByPk(req.session.user.id).then(user => {
    currentUser = user;
    return user;
  }).then(user => {
    return user.getOrders({include: ['products']});
  }).then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
      errorMessage:message
    });
  }).catch(err => {console.log(err)});
};

exports.getCheckout = (req,res,next)=>{
  let total = 0;
  let ps; //products placeholder since they get destroyed on subsequent calls
  User.findByPk(req.session.user.id).then(user => {
    return user;
    })
    .then(user => {
    return user.getCart();
    })
    .then(cart => {
    req.session.user.cart = cart
    return cart.getProducts();
    })
  .then(products => {
    ps = products
    products.forEach(element => {
      total += element.price * element.cartItem.quantity;
    })
    ///////////////////////stripe block////////////////////////////////////////
    return stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map(p => {
        return {
          quantity: p.cartItem.quantity,
          price_data: {
            currency: "usd",
            unit_amount: p.price * 100,
            product_data: {
              name: p.title,
              description: p.description,
              images: [p.imageUrl],
            },
          },
        };
      }),
      mode: "payment",
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
    });
    ///////////////////////stripe block////////////////////////////////////////
  })
  .then(session=>{
    res.render('shop/checkout', {
      path: '/checkout',
      pageTitle: 'Checkout',
      products: ps,
      totalSum:total,
      sessionId:session.id
    })
  })
  .catch(err => {console.log(err)})
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findByPk(orderId)
    .then(order => {
      //if no orders are found (invalid access link)
      if (!order) {
        return next(new Error('No order found.'));
      }
      //to prevent unauthorized access
      if (order.userId.toString() !== req.session.user.id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="' + invoiceName + '"' //open in browser not download
      );
      //stream the PDF
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Order Report', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      return order.getProducts()
      .then(products=>{
        products.forEach(prod => {
          totalPrice += prod.orderItem.quantity * prod.price;
          pdfDoc.fontSize(14).text(prod.title +' - ' +prod.orderItem.quantity +' x ' + '$' +prod.price);
        });
        pdfDoc.text('---');
        pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

        pdfDoc.end();
      })
    })
    .catch(err => next(err));
};

exports.getSearch = (req,res,next)=>{
  const search = req.query.search;
  let brands = [];
  let countries = [];
  let sizes = [];
  let allProducts;
  const searchOptions = {
    brand:req.query.brand,
    size:req.query.size,
    country:req.query.country
  }
  Product.findAll()
  .then(allproducts=>{
    for(let product of allproducts){
      allProducts = allproducts;
      let detail = {};
      sizes.push(product.size);
      countries.push(product.country);
      brands.push(product.brand);
    }
    sizes = helper.removeDuplicates(sizes).sort();
    brands = helper.removeDuplicates(brands).sort();
    countries = helper.removeDuplicates(countries).sort();
    if(search){
      const Op = Sequelize.Op;
      Product.findAll({
        where:{
          title:{
            [Op.like]: `%${search}%`
          },
          size:{
            [Op.like]: `%${searchOptions.size}%`
          },
          brand:{
            [Op.like]: `%${searchOptions.brand}%`
          },
          country:{
            [Op.like]: `%${searchOptions.country}%`
          }
        }
      })
      .then(products=>{
        res.render('shop/search', {
          path: '/search',
          pageTitle: 'Search',
          prods:products,
          brands:brands,
          sizes:sizes,
          countries:countries
        })
      })
    }
    else{
      res.render('shop/search', {
        path: '/search',
        pageTitle: 'Search',
        prods:[],
        brands:brands,
        sizes:sizes,
        countries:countries
      })
    }
  })
}