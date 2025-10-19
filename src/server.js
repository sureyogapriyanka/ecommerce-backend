import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

console.log('🔧 Starting server setup...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('📍 Port:', process.env.PORT || 5050);

// Connect to database
console.log('🔌 Attempting to connect to database...');
connectDB();

const app = express();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - more permissive for bytexl deployment
const corsOptions = {
  origin: true, // Reflect the origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Authorization']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions)); // Always use CORS with options
app.use(express.json());

// Add logging middleware to see all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  console.log('🏥 Health check endpoint hit');
  res.json({ 
    message: "Server is running!", 
    timestamp: new Date().toISOString()
  });
});

// API Routes - MUST come BEFORE static file serving
console.log('atedRoute registration...');
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Add a specific route to verify API routes are working
app.get("/api/test", (req, res) => {
  console.log('🧪 API test endpoint hit');
  res.json({ 
    message: "API routes are working!",
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files - MUST come AFTER API routes
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath, { 
  maxAge: '1d',
  etag: false
}));

// SPA fallback: serve index.html for all non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  console.log('🌐 Serving index.html for:', req.url);
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      console.log('⚠️  index.html not found, API-only mode');
      res.status(404).json({ 
        message: 'Frontend files not found. API-only mode.',
        apiDocs: '/api/health'
      });
    }
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () => {
  console.log(
    `✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
  
  // Check if dist directory exists
  import('fs').then(fs => {
    if (fs.existsSync(distPath)) {
      console.log(`📁 Serving frontend files from: ${distPath}`);
    } else {
      console.log('⚠️  Frontend dist directory not found - API-only mode');
    }
  });
});

// Handle server startup errors
server.on('error', (err) => {
  console.error('❌ Server failed to start:', err);
});

export default app;