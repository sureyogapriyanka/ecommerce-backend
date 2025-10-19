import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';

const updateAllProductsToInStock = async () => {
    try {
        // Connect to database
        await connectDB();

        // Update all products to be in stock with a default stock count
        const result = await Product.updateMany(
            {}, // Empty filter to match all products
            {
                $set: {
                    inStock: true,
                    stockCount: 100
                }
            }
        );

        console.log(`Successfully updated ${result.modifiedCount} products to in stock status`);
        console.log('All products are now marked as in stock with 100 units available');

        process.exit(0);
    } catch (error) {
        console.error('Error updating product stock status:', error);
        process.exit(1);
    }
};

// Run the update if this script is executed directly
if (process.argv[1] && process.argv[1].endsWith('updateProductStock.js')) {
    updateAllProductsToInStock();
}

export default updateAllProductsToInStock;