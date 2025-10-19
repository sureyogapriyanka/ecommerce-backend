import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    options: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Ensure a user can only have a product in their cart once
cartItemSchema.index({ user: 1, product: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartItemSchema);

export default Cart;