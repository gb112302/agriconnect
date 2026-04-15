const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

console.log("🚀 Starting AgriConnect Backend Server...");

// Middleware
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, "https://agriconnectgb.netlify.app"]
      : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("✅ Middleware loaded");

// Database connection
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log("⚠️  No MONGODB_URI found, using in-memory database...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log("✅ In-memory MongoDB connected");
    } else {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ MongoDB Atlas connected successfully");
    }

    // Seed demo accounts after DB is ready
    await seedDemoAccounts();
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  }
}

// Auto-seed demo accounts so credentials always work on startup
async function seedDemoAccounts() {
  try {
    const User = require("./models/User");

    const demoUsers = [
      {
        name: "Demo Farmer",
        email: "farmer@test.com",
        password: "password123",
        role: "farmer",
        availableRoles: ["farmer"],
        phone: "9111111111",
        location: {
          state: "Gujarat",
          district: "Ahmedabad",
          pincode: "380001",
        },
        emailVerified: true,
        isActive: true,
      },
      {
        name: "Demo Buyer",
        email: "buyer@test.com",
        password: "password123",
        role: "buyer",
        availableRoles: ["buyer"],
        phone: "9222222222",
        location: { state: "Maharashtra", district: "Pune", pincode: "411001" },
        emailVerified: true,
        isActive: true,
      },
      {
        name: "Admin User",
        email: "admin@agriconnect.com",
        password: "Admin@123",
        role: "admin",
        availableRoles: ["admin", "farmer", "buyer"],
        phone: "9999999999",
        location: {
          state: "Gujarat",
          district: "Ahmedabad",
          pincode: "380001",
        },
        emailVerified: true,
        isActive: true,
      },
    ];

    for (const userData of demoUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
        console.log(
          `✅ Demo account created: ${userData.email} (${userData.role})`,
        );
      }
    }
    console.log("🌱 Demo accounts ready");
  } catch (err) {
    console.error("⚠️  Could not seed demo accounts:", err.message);
  }
}

connectDB();

// Routes
console.log("📦 Loading routes...");

try {
  app.use("/api/auth", require("./routes/auth"));
  console.log("✅ Auth routes loaded");
} catch (e) {
  console.error("❌ Auth routes error:", e.message);
}

try {
  app.use("/api/products", require("./routes/products"));
  console.log("✅ Products routes loaded");
} catch (e) {
  console.error("❌ Products routes error:", e.message);
}

try {
  app.use("/api/orders", require("./routes/orders"));
  console.log("✅ Orders routes loaded");
} catch (e) {
  console.error("❌ Orders routes error:", e.message);
}

try {
  app.use("/api/bulk-requests", require("./routes/bulkRequests"));
  console.log("✅ Bulk requests routes loaded");
} catch (e) {
  console.error("❌ Bulk requests routes error:", e.message);
}

try {
  app.use("/api/reviews", require("./routes/reviews"));
  console.log("✅ Reviews routes loaded");
} catch (e) {
  console.error("❌ Reviews routes error:", e.message);
}

try {
  app.use("/api/payments", require("./routes/payments"));
  console.log("✅ Payments routes loaded");
} catch (e) {
  console.error("❌ Payments routes error:", e.message);
}

try {
  app.use("/api/analytics", require("./routes/analytics"));
  console.log("✅ Analytics routes loaded");
} catch (e) {
  console.error("❌ Analytics routes error:", e.message);
}

try {
  app.use("/api/admin", require("./routes/admin"));
  console.log("✅ Admin routes loaded");
} catch (e) {
  console.error("❌ Admin routes error:", e.message);
}

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "AgriConnect API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "AgriConnect API",
    version: "1.0.0",
    endpoints: ["/api/health", "/api/auth", "/api/products", "/api/orders"],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
