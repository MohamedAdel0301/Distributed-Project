const Product = require('../models/product');

exports.getAllProducts = (req,res)=>{
    {
        Product.findAll({raw: true, nest:true, attributes:{exclude:['userId']}})
        .then(products => {
            res.status(200).json({
                status: 'success',
                requestedAt: req.requestTime,
                results: products.length,
                data: {
                  products
                }
            });
        })
        .catch(err => {console.log(err);});
      };
}

exports.getProductById = (req,res)=>{
    const id = req.params.id * 1;
    Product.findAll({ raw: true, nest:true, attributes:{exclude:['userId']} })
    .then(products=>{
        const product = products.find(el => el.id === id)
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            results: products.length,
            data: {
              product
            },
            link: `dummy/products/${id}`
        });
    })
    .catch(err=>{console.log(err)})
}

exports.addProduct = (req,res)=>{
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const country = req.body.country;
    const size = req.body.size;
    const brand = req.body.brand;
    if(price == NaN || title == null || imageUrl == null || description == null || price == null){
        res.status(400).json({
            status: 'Bad Request',
        })
    }
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        country:country,
        brand:brand,
        size:size,
    });
    product.save()
    .then(success=>{
        res.status(200).json({
            status:'success',
            message:"Product added successfully"
        })
    })
    .catch(err=>{console.log(err)})
}

exports.editProduct = (req,res)=>{
    const prodId = req.params.id * 1;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const updatedSize = req.body.size;
    const updatedBrand = req.body.brand;
    const updatedCountry = req.body.country;
    Product.findByPk(prodId)
    .then(product => {
        product.title = updatedTitle || product.title;
        product.price = updatedPrice || product.price;
        product.description = updatedDesc || product.description;
        product.imageUrl=updatedImageUrl || product.imageUrl;
        product.brand = updatedBrand || product.brand;
        product.country = updatedCountry || product.country;
        product.size = updatedSize || product.size;
        return product.save()
        .then(result => {
            res.status(200).json({
                status: 'success',
                message:'product edited successfully',
                data: product
            });
        })
    })
    .catch(err=>{console.log(err)})
}

exports.deleteProduct = (req,res)=>{
    const prodId = req.params.id * 1;
    Product.findByPk(prodId)
    .then(product=>{
        product.destroy()
    })
    .then(result=>{
        res.status(204).json({
            status: 'success',
            data: null
        })
    })
    .catch(err=>{console.log(err)})
}