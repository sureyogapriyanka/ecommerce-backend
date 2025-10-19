import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        console.log('=== GET CART DEBUG ===');
        console.log('User ID from token:', req.user.id);

        const cartItems = await Cart.find({ user: req.user.id })
            .populate('product', 'id name price images rating reviewCount inStock');

        console.log('Found cart items:', cartItems.map(item => ({
            _id: item._id,
            product: {
                _id: item.product?._id,
                id: item.product?.id,
                name: item.product?.name
            },
            quantity: item.quantity
        })));

        // Calculate cart totals
        let subtotal = 0;
        cartItems.forEach(item => {
            if (item.product && item.product.price && !isNaN(item.product.price)) {
                subtotal += item.product.price * item.quantity;
            }
        });

        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;

        // Filter out items with invalid product data
        const validCartItems = cartItems.filter(item =>
            item.product &&
            item.product.price !== undefined &&
            item.product.price !== null &&
            !isNaN(item.product.price)
        );

        res.json({
            success: true,
            count: validCartItems.length,
            subtotal,
            tax,
            total,
            items: validCartItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, options = {} } = req.body;

        console.log('=== ADD TO CART DEBUG ===');
        console.log('User ID from token:', req.user.id);
        console.log('Product ID:', productId);
        console.log('Quantity:', quantity);

        // Check if product exists - try both custom id and MongoDB _id
        let product = await Product.findOne({ id: productId });
        
        // If not found by custom id, try MongoDB _id
        if (!product) {
            product = await Product.findById(productId);
        }
        
        if (!product) {
            console.log('Product not found for ID:', productId);
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log('Found product:', product.name);

        // Check if item already in cart
        let cartItem = await Cart.findOne({
            user: req.user.id,
            product: product._id
        });

        console.log('Existing cart item:', cartItem ? cartItem._id : 'None');

        if (cartItem) {
            // Update quantity
            cartItem.quantity += quantity;
            await cartItem.save();
            console.log('Updated cart item quantity:', cartItem.quantity);
        } else {
            // Add new item to cart
            cartItem = await Cart.create({
                user: req.user.id,
                product: product._id,
                quantity,
                options
            });
            console.log('Created new cart item:', cartItem._id);
        }

        // Populate product details
        await cartItem.populate('product', 'id name price images rating reviewCount inStock');

        res.status(201).json({
            success: true,
            message: 'Product added to cart',
            item: cartItem
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        console.log('Updating cart item with ID:', req.params.id, 'Quantity:', quantity);

        // Don't allow quantity less than 1
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        // Try to find the cart item by ID - try multiple approaches
        let cartItem = await Cart.findById(req.params.id);

        // If not found by _id, try to find by user and product ID (both custom id and MongoDB _id)
        if (!cartItem) {
            // Try to find by user and product reference (both formats)
            cartItem = await Cart.findOne({
                user: req.user.id,
                $or: [
                    { product: req.params.id },
                    { 'product.id': req.params.id }
                ]
            });
        }

        if (!cartItem) {
            console.log('Cart item not found for ID:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        // Check if user owns this cart item
        if (cartItem.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'User not authorized'
            });
        }

        // Update quantity
        cartItem.quantity = quantity;
        await cartItem.save();

        // Populate product details
        await cartItem.populate('product', 'id name price images rating reviewCount inStock');

        res.json({
            success: true,
            message: 'Cart item updated',
            item: cartItem
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        console.log('=== REMOVE FROM CART DEBUG ===');
        console.log('User ID from token:', req.user.id);
        console.log('Requested item ID:', req.params.id);

        // Try to find the cart item by ID - try multiple approaches
        let cartItem = await Cart.findById(req.params.id);
        console.log('Found by _id:', cartItem ? cartItem._id : 'Not found');

        // If not found by _id, try to find by user and product ID (both custom id and MongoDB _id)
        if (!cartItem) {
            console.log('Trying to find by user and product ID');
            // Try to find by user and product reference (both formats)
            cartItem = await Cart.findOne({
                user: req.user.id,
                $or: [
                    { product: req.params.id },
                    { 'product.id': req.params.id }
                ]
            });
            console.log('Found by user and product ID:', cartItem ? cartItem._id : 'Not found');
        }

        // If still not found, let's see what's in the database
        if (!cartItem) {
            console.log('Still not found, checking all cart items for user');
            const allUserItems = await Cart.find({ user: req.user.id });
            console.log('All cart items for user:', allUserItems.map(item => ({
                _id: item._id,
                product: item.product
            })));
        }

        if (!cartItem) {
            console.log('Cart item not found for ID:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        // Check if user owns this cart item
        if (cartItem.user.toString() !== req.user.id) {
            console.log('User authorization failed');
            console.log('Cart item user:', cartItem.user.toString());
            console.log('Request user:', req.user.id);
            return res.status(403).json({
                success: false,
                message: 'User not authorized'
            });
        }

        console.log('Removing cart item:', cartItem._id);
        await Cart.findByIdAndDelete(cartItem._id);

        // Get updated cart items
        const updatedCartItems = await Cart.find({ user: req.user.id })
            .populate('product', 'id name price images rating reviewCount inStock');

        console.log('Item removed successfully, updated cart items count:', updatedCartItems.length);

        res.json({
            success: true,
            message: 'Product removed from cart',
            items: updatedCartItems
        });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({ user: req.user.id });

        res.json({
            success: true,
            message: 'Cart cleared',
            items: [] // Return empty array for consistency
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};