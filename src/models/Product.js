import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    images: [{
        type: String
    }],
    features: [{
        type: String
    }],
    specifications: {
        type: Map,
        of: String
    },
    options: {
        type: Map,
        of: [String]
    },
    inStock: {
        type: Boolean,
        default: true
    },
    stockCount: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    shippingInfo: {
        weight: String,
        dimensions: {
            length: String,
            width: String,
            height: String
        },
        freeShipping: Boolean
    },
    featured: {
        type: Boolean,
        default: false
    },
    deals: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Product', productSchema);