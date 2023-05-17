const Product = require('../models/product');
const User = require('../models/user');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs')
const Order = require('../models/order')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const country = req.body.country;
  const size = req.body.size;
  const brand = req.body.brand;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    country:country,
    brand:brand,
    size:size,
    userId: req.session.user.id
  });
  product.save()
  .then(result => {
    res.redirect('/admin/products');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findAll({ where: { id: prodId } })
    .then(products => {
      const product = products[0];
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const updatedSize = req.body.size;
  const updatedBrand = req.body.brand;
  const updatedCountry = req.body.country;
  Product.findByPk(prodId).then(product => {
    if(product.userId.toString() !== req.session.user.id.toString()){
      return res.redirect('/')
    }
    product.title = updatedTitle || product.title;
    product.price = updatedPrice || product.price;
    product.description = updatedDesc || product.description;
    product.imageUrl=updatedImageUrl || product.imageUrl;
    product.brand = updatedBrand || product.brand;
    product.country = updatedCountry || product.country;
    product.size = updatedSize || product.size;
    return product.save()
    .then(result => {
      res.redirect('/admin/products');
    })
  })
  .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll({where:{userId:req.session.user.id}})
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.destroy({where:{userId:req.session.user.id, id:prodId}})
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.getInfo = (req,res) =>{
  const userkey = req.session.user.id;
  User.findByPk(userkey)
  .then(user=>{
    res.render('admin/info',{
      pageTitle: 'Info',
      path: '/admin/info',
      user:user
    });
  })
}


exports.getSalesReport = (req,res) =>{
  let revenue = 0;
  const invoiceName = "Sales.pdf";
  const invoicePath = path.join('data', 'invoices', invoiceName);
  const pdfDoc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition','attachment; filename="' + invoiceName + '"');
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);
  pdfDoc.fontSize(26).text('Sales Report', {underline: true});
  pdfDoc.text('-----------------------');
  Order.findAll()
  .then(orders=>{
      orders.forEach(order=>{
          order.getProducts()
          .then(products=>{
              products.forEach(prod => {
                if(prod.userId == req.session.user.id){
                  pdfDoc.fontSize(14).text(prod.title +' - ' +prod.orderItem.quantity +' x ' + '$' +prod.price);
                  revenue += prod.orderItem.quantity*prod.price;
                  pdfDoc.fontSize(14).text('----------------------------------------');
                }
              });
          })
      })
  })
  setInterval(()=>pdfDoc.fontSize(14).text(`Total Revenune: $${revenue}`),2000);
  setInterval(()=>pdfDoc.end(),2000);
}

exports.addBalance= (req,res)=>{
  const userkey = req.session.user.id;
  User.findByPk(userkey)
  .then(user=>{
    user.balance = user.balance+50;
    return user.save()
  })
  .then(user=>{
    res.redirect('/admin/info');
  })
  .catch(err=>{console.log(err)})
}