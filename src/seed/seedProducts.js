import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import products from '../data/products.js';

connectDB();

const importData = async () => {
    try {
        // Clear existing products
        await Product.deleteMany();

        // Insert new products
        await Product.insertMany(products);

        console.log('Products imported successfully');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Product.deleteMany();

        console.log('Products destroyed successfully');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}