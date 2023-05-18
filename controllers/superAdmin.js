const PDFDocument = require('pdfkit');
const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product')
const fs = require('fs');
const path = require('path');

exports.getMod = (req,res)=>{
    if(req.session.user.type == 1){
        Product.findAll()
        .then(products=>{
            res.render('admin/moderation', {
                path: '/moderation',
                pageTitle: 'Moderation',
                prods:products
            })
        })
    }
    else{
        res.status(404).render('404', {
            pageTitle: 'ERROR: Page Not Found',
            path: '/404',
        });
    }
}

exports.getProducts = (req, res, next) => {
    Product.findAll()
      .then(products => {
        res.render('admin/moderation', {
          prods: products,
          pageTitle: 'All Products',
          path: '/admin/moderation'
        });
      })
      .catch(err => console.log(err));
  };

exports.postOrders = (req,res)=>{
    let totalPrice = 0;
    const invoiceName = "List of orders.pdf";
    const invoicePath = path.join('data', 'invoices', invoiceName);
    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition','attachment; filename="' + invoiceName + '"');
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    pdfDoc.fontSize(26).text('Orders Report', {underline: true});
    pdfDoc.text('-----------------------');
    Order.findAll()
    .then(orders=>{
        orders.forEach(order=>{
            order.getProducts()
            .then(products=>{
                pdfDoc.fontSize(14).text("Order Id: "+order.id+ " UserId: "+order.userId);
                pdfDoc.fontSize(14).text('-------');
                products.forEach(prod => {
                  totalPrice += prod.orderItem.quantity * prod.price;
                  pdfDoc.fontSize(14).text(prod.title +' - ' +prod.orderItem.quantity +' x ' + '$' +prod.price);
                });
                pdfDoc.text('---');
                pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
                pdfDoc.fontSize(14).text('----------------------------------------');
                totalPrice = 0;
            })
        })
    })
    setInterval(()=>pdfDoc.end(),4000);
}


exports.postUsers = (req,res)=>{
    let allusers
    User.findAll()
    .then(users => {
    allusers = users;
    const invoiceName = "List of users.pdf";
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition','attachment; filename="' + invoiceName + '"');
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    pdfDoc.fontSize(26).text('Users Report', {underline: true});
    pdfDoc.text('-----------------------');
    users.forEach(user=>{
        pdfDoc.fontSize(14).text("Username: "+user.name +' -' +" ID: "+user.id +' -'+" Email: "+user.email+ ' -' + " Balance: "+user.balance);
        pdfDoc.fontSize(14).text('----------------------------------------');
    })
    pdfDoc.end();
    })
    .catch(err => (err));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.destroy({where:{id:prodId}})
      .then(result => {
        res.redirect('/admin/moderation/');
      })
      .catch(err => console.log(err));
  };