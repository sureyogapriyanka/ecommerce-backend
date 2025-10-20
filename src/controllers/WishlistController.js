import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Fields to populate for products in wishlist
const productFields = 'id name price images rating reviewCount inStock category subcategory';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const wishlistItems = await Wishlist.find({ user: req.user.id })
            .populate('product', productFields);

        res.json({
            success: true,
            count: wishlistItems.length,
            items: wishlistItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Check if product exists
        const product = await Product.findOne({ id: productId });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if item already in wishlist
        const existingItem = await Wishlist.findOne({
            user: req.user.id,
            product: product._id
        });

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        // Add to wishlist
        const wishlistItem = await Wishlist.create({
            user: req.user.id,
            product: product._id
        });

        // Populate product details
        await wishlistItem.populate('product', productFields);

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist',
            item: wishlistItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        let wishlistItem = await Wishlist.findById(req.params.id);

        // If not found by _id, try to find by user and product id
        if (!wishlistItem) {
            const product = await Product.findOne({ id: req.params.id });
            if (product) {
                wishlistItem = await Wishlist.findOne({
                    user: req.user.id,
                    product: product._id
                });
            }
        }

        if (!wishlistItem) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist item not found'
            });
        }

        // Ensure user owns the wishlist item
        if (wishlistItem.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'User not authorized'
            });
        }

        await Wishlist.findByIdAndDelete(wishlistItem._id);

        // Return updated wishlist
        const updatedWishlist = await Wishlist.find({ user: req.user.id })
            .populate('product', productFields);

        res.json({
            success: true,
            message: 'Product removed from wishlist',
            items: updatedWishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Clear user's wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
    try {
        await Wishlist.deleteMany({ user: req.user.id });

        res.json({
            success: true,
            message: 'Wishlist cleared'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
};
