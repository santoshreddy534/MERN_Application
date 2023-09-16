const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id)=>{
    Product.findById(id)
    .populate("category")
    .exec((err, prod)=>{
        if(err || !prod){
            return res.status(400).json({
                error: "No product found in DB"
            })
        }
        req.product = prod;
        next();
    })
}

//Create
exports.createProduct = (req, res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file)=>{
        if(err){
            res.status(400).json({
                error: "Problem with Image"
            })
        }
        //destructure the fields
        const {name, description, price, category, stock} = fields;
        if(
            !name || !description || !price || !category || !stock
            ){
                return res.status(400).json({
                    error: "Please include all fields"
                });
            }
        let product = new Product(fields);

        //handle file here
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "File Size Too Big!"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;
        }

        //Save to the DB
        product.save((err, product)=>{
            if(err){
                return res.status(400).json({
                    error: "Saving tshirt in DB failed"
                })
            }
            res.json(product);
        })
    })
}

//Get
exports.getProduct = (req, res)=>{
    req.product.photo = undefined;
    return res.json(req.product);
}

//middleware
exports.photo = (req, res, next)=>{
    if(req.product.photo.data){
        res.set("Content-Type", req.product.photo.contentType);
        return res.send(req.product.photo.data)
    }
    next();
}

//delete controller
exports.deleteProduct = (req, res)=>{
    const product = req.product;
    product.remove((err, deletedProduct)=>{
        if(err){
            return res.status(400).json({
                error: "Not able to delete Product"
            })
        }
        res.json({
            message: `Product deleted successfully`,
            deletedProduct
        });
    })
}

//Update controller
exports.updateProduct = (req, res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file)=>{
        if(err){
            res.status(400).json({
                error: "Problem with Image"
            })
        }
        
        //updation code
        let product = req.product;
        product = _.extend(product, fields)

        //handle file here
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "File Size Too Big!"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;
        }

        //Save to the DB
        product.save((err, product)=>{
            if(err){
                return res.status(400).json({
                    error: "Updation of product failed"
                })
            }
            res.json(product);
        })
    })
}

//Product Listing
exports.getAllProducts=(req, res)=>{
    let limit = req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products)=>{
        if(err){
            return res.status(400).json({
                error: "Cannot retrieve products from Database"
            })
        }
        res.json(products)
    })
}

//Update Stock
exports.updateStock = (req, res, next)=>{
let myOperation = req.body.order.products.map((prod=>{
    return {
        updateOne:{
            filter: {_id: prod._id},
            update: {stock: -prod.count, sold: +prod.count}
        }
    }
}))
Product.bulkWrite(myOperation, {}, (err, products)=>{
    if(err){
        return res.status(400).json({
            error: "Bulk Operation Failed"
        })
    }
    next();
});
}

exports.getAllUniqueCategories = (req, res)=>{
    Product.distinct("category", {}, (err, category)=>{
        if(err){
            return res.status(400).json({
                error: "No Category Found"
            })
        }
        res.json(category);
    })
}