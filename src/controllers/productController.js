import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 12, q, category, featured, deals } = req.query;

        const filter = {};

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } }
            ];
        }

        if (category) filter.category = category;
        if (featured) filter.featured = featured === 'true';
        if (deals) filter.deals = deals === 'true';

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const products = await Product.find(filter)
            .limit(limitNum)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalProducts: total,
                    hasNext: pageNum < Math.ceil(total / limitNum),
                    hasPrev: pageNum > 1
                }
            }
        });
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Product not found' 
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error in getProductById:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        const createdProduct = await product.save();
        res.status(201).json({
            success: true,
            data: createdProduct
        });
    } catch (error) {
        console.error('Error in createProduct:', error);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Product not found' 
            });
        }

        Object.keys(req.body).forEach(key => {
            product[key] = req.body[key];
        });

        const updatedProduct = await product.save();
        res.json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error in updateProduct:', error);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Product not found' 
            });
        }

        await product.remove();
        res.json({ 
            success: true,
            message: 'Product removed' 
        });
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// ✅ @desc    Get unique product categories
// ✅ @route   GET /api/products/categories
// ✅ @access  Public
const getCategories = async (req, res) => {
    try {
        const products = await Product.find({}, 'category');
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const formattedCategories = categories.map((name, idx) => ({ 
            id: idx.toString(), 
            name 
        }));
        res.json({
            success: true,
            data: formattedCategories
        });
    } catch (error) {
        console.error('Error in getCategories:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error' 
        });
    }
};

export default {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
};