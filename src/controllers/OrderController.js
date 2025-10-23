import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        console.log('=== ORDER CREATION DEBUG ===');
        console.log('Received order request:', JSON.stringify(req.body, null, 2));
        console.log('User ID from token:', req.user.id);

        const {
            items,
            shippingAddress,
            paymentMethod,
            tax,
            shipping,
            total
        } = req.body;

        // Validate required fields
        if (!items || items.length === 0) {
            console.log('Order validation failed: No items');
            return res.status(400).json({
                success: false,
                message: 'Order must have at least one item'
            });
        }

        if (!shippingAddress) {
            console.log('Order validation failed: No shipping address');
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required'
            });
        }

        if (!paymentMethod) {
            console.log('Order validation failed: No payment method');
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }

        // Create order items with product details
        const orderItems = [];
        for (const item of items) {
            console.log('Processing item:', item);

            // Try to find product by different possible ID fields
            const productId = item.productId || item.id;
            console.log('Looking for product with ID:', productId);

            // Try multiple ways to find the product
            let product = await Product.findOne({ id: productId });
            console.log('Found by id field:', product ? product.name : 'Not found');

            if (!product) {
                product = await Product.findById(productId);
                console.log('Found by _id field:', product ? product.name : 'Not found');
            }

            if (!product) {
                product = await Product.findOne({ _id: productId });
                console.log('Found by _id query:', product ? product.name : 'Not found');
            }

            // If still not found, try to find by name as a fallback
            if (!product) {
                product = await Product.findOne({ name: item.name });
                console.log('Found by name:', product ? product.name : 'Not found');
            }

            // If we still can't find the product, create a minimal product object
            if (!product) {
                console.log('Product not found for ID:', productId, 'Creating minimal product object');
                product = {
                    id: productId,
                    _id: productId,
                    name: item.name || 'Unknown Product',
                    images: [item.image || '/placeholder.jpg'],
                    price: item.price || 0
                };
            } else {
                console.log('Found product:', product.name);
            }

            orderItems.push({
                productId: product.id || product._id,
                name: product.name,
                image: product.images?.[0] || product.image || '/placeholder.jpg',
                price: product.price,
                quantity: item.quantity,
                options: item.options || {}
            });
        }

        console.log('Creating order with items:', orderItems);

        // Create order
        const order = await Order.create({
            userId: req.user.id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            tax: tax || 0,
            shipping: shipping || 0,
            total,
            status: 'pending'
        });

        console.log('Order created successfully:', order._id);

        // Clear user's cart after successful order
        await Cart.deleteMany({ user: req.user.id });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('=== ORDER CREATION ERROR ===');
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders for logged in user
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        console.log('=== GET ORDER BY ID DEBUG ===');
        console.log('Requested order ID:', req.params.id);
        console.log('User ID:', req.user.id);
        
        const order = await Order.findById(req.params.id);
        
        console.log('Found order:', order ? 'Yes' : 'No');

        if (!order) {
            console.log('Order not found in database');
            return res.status(404).json({
                success: false,
                message: `Order with ID "${req.params.id}" not found`
            });
        }

        // Check if user owns this order
        if (order.userId.toString() !== req.user.id) {
            console.log('User not authorized to view this order');
            return res.status(403).json({
                success: false,
                message: 'User not authorized to view this order'
            });
        }
        
        // Add default values if not present
        if (!order.status) order.status = 'pending';
        if (!order.estimatedDeliveryDate) {
            // Default to 3-5 days from now
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 3 + Math.floor(Math.random() * 3));
            order.estimatedDeliveryDate = deliveryDate;
        }

        console.log('Returning order:', order._id);
        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('=== GET ORDER BY ID ERROR ===');
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching order details'
        });
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User not authorized'
            });
        }

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'username email');

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status, trackingNumber, estimatedDeliveryDate } = req.body;

        // Check if user is admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'User not authorized'
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;

        const updatedOrder = await order.save();

        res.json({
            success: true,
            message: 'Order status updated',
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
};