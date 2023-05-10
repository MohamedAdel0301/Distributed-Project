const Product = require('../models/product');
const User = require('../models/user');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn
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
        product: product,
        isAuthenticated:req.session.isLoggedIn
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
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl=updatedImageUrl;
    product.brand = updatedBrand;
    product.country = updatedCountry;
    product.size = updatedSize;
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
      console.log(products);
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