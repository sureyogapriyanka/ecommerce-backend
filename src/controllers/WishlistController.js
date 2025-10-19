import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const wishlistItems = await Wishlist.find({ user: req.user.id })
            .populate('product', 'id name price images rating reviewCount inStock');

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
        await wishlistItem.populate('product', 'id name price images rating reviewCount inStock');

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
        console.log('=== REMOVE FROM WISHLIST DEBUG ===');
        console.log('User ID from token:', req.user.id);
        console.log('Requested item ID:', req.params.id);

        // Try to find the wishlist item by ID
        let wishlistItem = await Wishlist.findById(req.params.id);
        console.log('Found by _id:', wishlistItem ? wishlistItem._id : 'Not found');

        // If not found by _id, try to find by user and product ID
        if (!wishlistItem) {
            console.log('Trying to find by user and product ID');
            const product = await Product.findOne({ id: req.params.id });
            if (product) {
                wishlistItem = await Wishlist.findOne({
                    user: req.user.id,
                    product: product._id
                });
                console.log('Found by user and product ID:', wishlistItem ? wishlistItem._id : 'Not found');
            }
        }

        if (!wishlistItem) {
            console.log('Wishlist item not found for ID:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Wishlist item not found'
            });
        }

        // Check if user owns this wishlist item
        if (wishlistItem.user.toString() !== req.user.id) {
            console.log('User authorization failed');
            return res.status(403).json({
                success: false,
                message: 'User not authorized'
            });
        }

        console.log('Removing wishlist item:', wishlistItem._id);
        await Wishlist.findByIdAndDelete(wishlistItem._id);

        // Get updated wishlist items
        const updatedWishlistItems = await Wishlist.find({ user: req.user.id })
            .populate('product', 'id name price images rating reviewCount inStock');

        console.log('Item removed successfully, updated wishlist items count:', updatedWishlistItems.length);

        res.json({
            success: true,
            message: 'Product removed from wishlist',
            items: updatedWishlistItems
        });
    } catch (error) {
        console.error('Error removing wishlist item:', error);
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