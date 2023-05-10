const PDFDocument = require('pdfkit');
const User = require('../models/user');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');

exports.getMod = (req,res)=>{
    if(type === 1){
        res.render('admin/moderation', {
            path: '/moderation',
            pageTitle: 'Moderation',
        })
    }
    else{
        res.status(404).render('404', {
            pageTitle: 'ERROR: Page Not Found',
            path: '/404',
            isAuthenticated:req.session.isLoggedIn
        });
    }
}

exports.postOrders = (req,res)=>{
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
        pdfDoc
            .fontSize(14)
            .text(
            prod.title +
                ' - ' +
                prod.orderItem.quantity +
                ' x ' +
                '$' +
                prod.price
            );
        });
        pdfDoc.text('---');
        pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

        pdfDoc.end();
    })
    })
    .catch(err => next(err));
}

exports.postUsers = (req,res)=>{
    let allusers
    User.findAll()
    .then(users => {
    allusers = users;
    const invoiceName = "List of users";
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