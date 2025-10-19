import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
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

// Load JWT_SECRET: check Render secret file first, fallback to .env
let JWT_SECRET;
const secretFilePath = '/etc/secrets/JWT_SECRET';
if (fs.existsSync(secretFilePath)) {
  JWT_SECRET = fs.readFileSync(secretFilePath, 'utf8').trim();
} else {
  JWT_SECRET = process.env.JWT_SECRET;
}
console.log('🔑 JWT_SECRET loaded:', JWT_SECRET ? '✅ yes' : '❌ no');

// Connect to database
console.log('🔌 Attempting to connect to database...');
connectDB();

const app = express();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const corsOptions = {
  origin: true, // Reflect the origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Authorization']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  console.log('🏥 Health check endpoint hit');
  res.json({ 
    message: "Server is running!", 
    timestamp: new Date().toISOString()
  });
});

// API Routes
console.log('Registering API routes...');
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Test route
app.get("/api/test", (req, res) => {
  console.log('🧪 API test endpoint hit');
  res.json({ 
    message: "API routes are working!",
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath, { 
  maxAge: '1d',
  etag: false
}));

// SPA fallback
app.get(/^\/(?!api).*/, (req, res) => {
  console.log('🌐 Serving index.html for:', req.url);
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      console.log('⚠️  index.html not found - API-only mode');
      res.status(404).json({ 
        message: 'Frontend files not found. API-only mode.',
        apiDocs: '/api/health'
      });
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Bind server to 0.0.0.0 for Render
const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );

  // Check if frontend dist exists
  if (fs.existsSync(distPath)) {
    console.log(`📁 Serving frontend files from: ${distPath}`);
  } else {
    console.log('⚠️  Frontend dist directory not found - API-only mode');
  }
});

// Handle startup errors
server.on('error', (err) => {
  console.error('❌ Server failed to start:', err);
});

export { JWT_SECRET };
export default app;
