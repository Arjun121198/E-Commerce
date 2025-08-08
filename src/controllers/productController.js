const Product = require('../models/product');
const fs = require('fs');
const path = require('path');
const { uploadImage } = require('../utils/imageUpload');
const OfferType = require('../utils/enums/offerType'); // Import OfferType class
const { successResponse, errorResponse } = require('../utils/responseHelper'); // Import the helper functions

class ProductController {
    // Create a new product
    createProduct = async (req, res) => {
        // try {
            const { category_id, name, description, offer_type, price } = req.body;
            const { image } = req.files || {};
            // Validate required fields
            if (!category_id || !name || !description || !price || !image) {
                return errorResponse(res, 400, 'Missing required fields. Category, name, description, price, and image are required.');
            }

            // Validate offer type only if provided, otherwise default to NO_OFFER
            let offerTypeInt = OfferType.OFFER_TYPES.NO_OFFER;
            if (offer_type !== undefined) {
                offerTypeInt = parseInt(offer_type, 10);
                if (!Object.values(OfferType.OFFER_TYPES).includes(offerTypeInt)) {
                    return errorResponse(res, 400, `Invalid offer type. Allowed values are: ${Object.values(OfferType.OFFER_TYPES).join(', ')}`);
                }
            }

            // Upload the image
            const uploadFolder = path.join(__dirname, '../../uploads/products');
            const imagePath = await uploadImage(image, uploadFolder);

            // Create the product instance
            const newProduct = new Product({ category_id, name, image: imagePath, description, offer_type: offerTypeInt, price });

            // Save the product
            const savedProduct = await newProduct.save();

            return successResponse(res, 201, 'Product created successfully', savedProduct);
        // } catch (error) {
        //     return errorResponse(res, 500, 'Failed to create product', error.message);
        // }
    };

    getAllProducts = async (req, res) => {
        try {
            const products = await Product.find().populate('category_id', 'name').lean();

            if (!products || products.length === 0) {
                return errorResponse(res, 404, 'No products found');
            }

            // Rename `category_id` to `category_detail` in each product
            const formattedProducts = products.map(({ category_id, ...product }) => ({
                ...product,
                offer_type: OfferType.castOfferType(product.offer_type),
                category_detail: category_id, // Rename category_id to category_detail
            }));

            return successResponse(res, 200, 'Products fetched successfully', formattedProducts);
        } catch (error) {
            return errorResponse(res, 500, 'Failed to fetch products', error.message);
        }
    };

    getProductById = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id).populate('category_id', 'name').lean();
            if (!product) return errorResponse(res, 404, 'Product not found');
            const { category_id, ...rest } = product;
            return successResponse(res, 200, 'Product fetched successfully', {
                ...rest,
                offer_type: OfferType.castOfferType(product.offer_type),
                category_detail: category_id,
            });
        } catch (error) {
            return errorResponse(res, 500, 'Failed to fetch product', error.message);
        }
    };

    updateProduct = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return errorResponse(res, 404, 'Product not found');

            const { name, description, offer_type, price, category_id } = req.body;
            if (name) product.name = name;
            if (description) product.description = description;
            if (price !== undefined) product.price = price;
            if (category_id) product.category_id = category_id;
            if (offer_type !== undefined) {
                const offerTypeInt = parseInt(offer_type, 10);
                if (!Object.values(OfferType.OFFER_TYPES).includes(offerTypeInt)) {
                    return errorResponse(res, 400, `Invalid offer type. Allowed values are: ${Object.values(OfferType.OFFER_TYPES).join(', ')}`);
                }
                product.offer_type = offerTypeInt;
            }

            if (req.files && req.files.image) {
                const uploadFolder = path.join(__dirname, '../../uploads/products');
                const newImagePath = await uploadImage(req.files.image, uploadFolder);

                if (product.image) {
                    const oldImagePath = path.join(__dirname, '../../', product.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                product.image = newImagePath;
            }

            const saved = await product.save();
            return successResponse(res, 200, 'Product updated successfully', saved);
        } catch (error) {
            return errorResponse(res, 500, 'Failed to update product', error.message);
        }
    };

    deleteProduct = async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return errorResponse(res, 404, 'Product not found');

            if (product.image) {
                const oldImagePath = path.join(__dirname, '../../', product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            await Product.findByIdAndDelete(req.params.id);
            return successResponse(res, 200, 'Product deleted successfully');
        } catch (error) {
            return errorResponse(res, 500, 'Failed to delete product', error.message);
        }
    };
}

module.exports = new ProductController();
